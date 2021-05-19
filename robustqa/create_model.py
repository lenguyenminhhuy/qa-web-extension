from transformers import AutoModelForQuestionAnswering
import wandb

WANDB_API_KEY="374849d759d61aa968eac6fc01c1c34743bd2caa"
wandb.login(key=WANDB_API_KEY)

with wandb.init(project="qa-system-all-models") as run:
    # Connect an Artifact to the run
    my_model_name = "minhdang241/qa-system-all-models/bt_context_question_model-01:v0"
    my_model_artifact = run.use_artifact(my_model_name, type='model')

    # Download model weights to a folder and return the path
    model_dir = my_model_artifact.download()

    # Load your Hugging Face model from that folder
    #  using the same model class
    model = AutoModelForQuestionAnswering.from_pretrained(model_dir)

