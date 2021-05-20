from abc import ABC
import json
import logging
import os
import ast
import torch
import numpy as np
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    AutoModelForQuestionAnswering,
    AutoModelForTokenClassification,
)
from ts.torch_handler.base_handler import BaseHandler
from captum.attr import LayerIntegratedGradients

logger = logging.getLogger(__name__)


class TransformersQuestionAnsweringHandler(BaseHandler, ABC):
    """
    Transformers handler class for sequence, token classification and question answering.
    """

    def __init__(self):
        super(TransformersQuestionAnsweringHandler, self).__init__()
        self.initialized = False

    def initialize(self, ctx):
        """In this initialize function, the BERT model is loaded and
        the Layer Integrated Gradients Algorithmfor Captum Explanations
        is initialized here.
        Args:
            ctx (context): It is a JSON Object containing information
            pertaining to the model artefacts parameters.
        """
        self.manifest = ctx.manifest
        properties = ctx.system_properties
        model_dir = properties.get("model_dir")
        serialized_file = self.manifest["model"]["serializedFile"]
        model_pt_path = os.path.join(model_dir, serialized_file)
        self.device = torch.device(
            "cuda:" + str(properties.get("gpu_id"))
            if torch.cuda.is_available()
            else "cpu"
        )
        # read configs for the mode, model_name, etc. from setup_config.json
        setup_config_path = os.path.join(model_dir, "setup_config.json")
        if os.path.isfile(setup_config_path):
            with open(setup_config_path) as setup_config_file:
                self.setup_config = json.load(setup_config_file)
        else:
            logger.warning("Missing the setup_config.json file.")

        # Loading the model and tokenizer from checkpoint and config files based on the user's choice of mode
        # further setup config can be added.
        if self.setup_config["save_mode"] == "torchscript":
            self.model = torch.jit.load(model_pt_path)
        elif self.setup_config["save_mode"] == "pretrained":
            if self.setup_config["mode"] == "question_answering":
                self.model = AutoModelForQuestionAnswering.from_pretrained(model_dir)
            else:
                logger.warning("Missing the operation mode.")
        else:
            logger.warning("Missing the checkpoint or state_dict.")

        if any(
            fname
            for fname in os.listdir(model_dir)
            if fname.startswith("vocab.") and os.path.isfile(fname)
        ):
            self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        else:
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.setup_config["model_name"]
            )

        self.model.to(self.device)
        self.model.eval()

        logger.info("Transformer model from path %s loaded successfully", model_dir)

        # Read the mapping file, index to object name
        mapping_file_path = os.path.join(model_dir, "index_to_name.json")
        # Question answering does not need the index_to_name.json file.
        if not self.setup_config["mode"] == "question_answering":
            if os.path.isfile(mapping_file_path):
                with open(mapping_file_path) as f:
                    self.mapping = json.load(f)
            else:
                logger.warning("Missing the index_to_name.json file.")

        self.initialized = True

    def preprocess(self, requests):
        logger.info(requests)
        # input_text = requests[0].get("data")
        # if input_text is None:
        input_text = requests[0].get("body")
        # input_text = json.loads(input_text)
        logger.info(
            input_text
        )

        # if isinstance(input_text, (bytes, bytearray)):
        #     input_text = input_text.decode("utf-8")

        max_length = self.setup_config["max_length"]
        doc_stride = self.setup_config["doc_stride"]
        logger.info(
            "Received text: '%s'", input_text
        )  # '{"question" :"How is the weather", "context": "The weather is nice, it is beautiful day"}'
        # preprocessing text
        # input_text = ast.literal_eval(
        # input_text
        # )  # Transform string to dictionary {"question" :"How is the weather", "context": "The weather is nice, it is beautiful day"}
        question = input_text["question"]  # "How is the weather"
        context = input_text["context"]  # "The weather is nice, it is beautiful day"

        tokenized_inputs = self.tokenizer(
            question,
            context,
            max_length=max_length,
            truncation="only_second",
            return_overflowing_tokens=True,
            return_offsets_mapping=True,
            stride=doc_stride,
            padding="max_length",
            return_tensors="pt",
        )

        # logger.info(f"Tokenized Inputs: {tokenized_inputs}")
        input_ids = tokenized_inputs["input_ids"].to(self.device).tolist()[0]

        return input_ids, tokenized_inputs, context

    def inference(self, preprocessed_data):
        """Predict the class (or classes) of the received text using the
        serialized transformers checkpoint.
        Args:
            input_batch (list): List of Text Tensors from the pre-process function is passed here
        Returns:
            list : It returns a list of the predicted value for the input text
        """

        input_ids, tokenized_inputs, context = preprocessed_data
        text_tokens = self.tokenizer.convert_ids_to_tokens(input_ids)
        del tokenized_inputs["overflow_to_sample_mapping"]
        offset_mappings = tokenized_inputs.pop("offset_mapping")
        output = self.model(**tokenized_inputs)

        # answer_start = torch.argmax(
        #     answer_start_scores
        # )  # Get the most likely beginning of answer with the argmax of the score
        # answer_end = torch.argmax(answer_end_scores) + 1  # Get the most likely end of answer with the argmax of the score

        # answer = self.tokenizer.convert_tokens_to_string(self.tokenizer.convert_ids_to_tokens(input_ids[answer_start:answer_end]))

        # logger.info("Model predicted: '%s'", answer)
        # logger.info(f"Model Inference: {output} {tokenized_inputs} {context}")

        return output, tokenized_inputs, context, offset_mappings

    def postprocess(self, inference_output):
        """Post Process Function converts the predicted response into Torchserve readable format.
        Args:
            inference_output (list): It contains the predicted response of the input text.
        Returns:
            (list): Returns a list of the Predictions and Explanations.
        """

        min_null_score = None
        output, tokenized_inputs, context, offset_mappings = inference_output
        all_start_logits, all_end_logits = output["start_logits"], output["end_logits"]
        all_start_logits = all_start_logits.detach().numpy()
        all_end_logits = all_end_logits.detach().numpy()

        n_features = len(output["start_logits"])
        n_best_size = 10
        valid_answers = list()
        for i in range(n_features):
            start_logits = all_start_logits[i]
            end_logits = all_end_logits[i]

            cls_index = (
                tokenized_inputs["input_ids"][i]
                .tolist()
                .index(self.tokenizer.cls_token_id)
            )
            feature_null_score = start_logits[cls_index] + end_logits[cls_index]
            if min_null_score is None or min_null_score < feature_null_score:
                min_null_score = feature_null_score

            offset_mapping = offset_mappings[i]
            start_indexes = np.argsort(start_logits)[-1 : -10 - 1 : -1].tolist()
            end_indexes = np.argsort(end_logits)[-1 : -10 - 1 : -1].tolist()
            for start_index in start_indexes:
                for end_index in end_indexes:
                    # logger.info("Start Index %s", str(start_index))
                    # logger.info("End Index %s", str(end_index))
                    if (
                        start_index >= len(offset_mapping)
                        or end_index >= len(offset_mapping)
                        or offset_mapping[end_index]
                        is None  # Check for the CLS and SEP token
                        or offset_mapping[start_index] is None
                        or end_index < start_index
                    ):
                        continue

                    start_char = offset_mapping[start_index][0]
                    end_char = offset_mapping[end_index][1]
                    valid_answers.append(
                        {
                            "score": start_logits[start_index] + end_logits[end_index],
                            "text": context[start_char : end_char + 1],
                            "index": [start_char.item(), end_char.item()],
                        }
                    )

            if len(valid_answers) > 0:
                # Get the best three answers
                best_answers = sorted(
                    valid_answers, key=lambda x: x["score"], reverse=True
                )[0:3]
            else:
                best_answers = {"text": "", "score": 0.0}

            for answer in best_answers:
                if answer["score"] < min_null_score:
                    answer["text"] = ""

        logger.info(f"Model postprocessing: {best_answers}")
        answers = dict()
        for i, a in enumerate(best_answers):
            answers[f"index_{i}"] = a["index"]
        logger.info(f"Model postprocessing: {answers}")

        return [answers]


def construct_input_ref(text, tokenizer, device):
    """For a given text, this function creates token id, reference id and
    attention mask based on encode which is faster for captum insights
    Args:
        text (str): The text specified in the input request
        tokenizer (AutoTokenizer Class Object): To word tokenize the input text
        device (cpu or gpu): Type of the Environment the server runs on.
    Returns:
        input_id(Tensor): It attributes to the tensor of the input tokenized words
        ref_input_ids(Tensor): Ref Input IDs are used as baseline for the attributions
        attention mask() :  The attention mask is a binary tensor indicating the position
         of the padded indices so that the model does not attend to them.
    """
    text_ids = tokenizer.encode(text, add_special_tokens=False)
    # construct input token ids
    # logger.info("text_ids %s", text_ids)
    # logger.info("[tokenizer.cls_token_id] %s", [tokenizer.cls_token_id])
    input_ids = [tokenizer.cls_token_id] + text_ids + [tokenizer.sep_token_id]
    # logger.info("input_ids %s", input_ids)

    input_ids = torch.tensor([input_ids], device=device)
    # construct reference token ids
    ref_input_ids = (
        [tokenizer.cls_token_id]
        + [tokenizer.pad_token_id] * len(text_ids)
        + [tokenizer.sep_token_id]
    )
    ref_input_ids = torch.tensor([ref_input_ids], device=device)
    # construct attention mask
    attention_mask = torch.ones_like(input_ids)
    return input_ids, ref_input_ids, attention_mask


def captum_sequence_forward(inputs, attention_mask=None, position=0, model=None):
    """This function is used to get the predictions from the model and this function
    can be used independent of the type of the BERT Task. In case of a QnA, there is no
    need to create two models. one model with different positions can be used.
    Args:
        inputs (list): Input for Predictions
        attention_mask (list, optional): The attention mask is a binary tensor indicating the position
         of the padded indices so that the model does not attend to them, it defaults to None.
        position (int, optional): Position depends on the BERT Task. If it is a QnA,
        then positon is set to 1. Defaults to 0.
        model ([type], optional): Name of the model, it defaults to None.
    Returns:
        list: Prediction Outcome
    """
    model.eval()
    model.zero_grad()
    pred = model(inputs, attention_mask=attention_mask)
    pred = pred[position]
    return pred


def summarize_attributions(attributions):
    """Summarises the attribution across multiple runs
    Args:
        attributions ([list): attributions from the Layer Integrated Gradients
    Returns:
        list : Returns the attributions after normalizing them.
    """
    attributions = attributions.sum(dim=-1).squeeze(0)
    attributions = attributions / torch.norm(attributions)
    return attributions


def get_word_token(input_ids, tokenizer):
    """constructs word tokens from token id using the BERT's
    Auto Tokenizer
    Args:
        input_ids (list): Input IDs from construct_input_ref method
        tokenizer (class): The Auto Tokenizer Pre-Trained model object
    Returns:
        (list): Returns the word tokens
    """
    indices = input_ids[0].detach().tolist()
    tokens = tokenizer.convert_ids_to_tokens(indices)
    # Remove unicode space character from BPE Tokeniser
    tokens = [token.replace("Ġ", "") for token in tokens]
    return tokens