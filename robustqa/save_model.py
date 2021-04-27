from transformers import DistilBertTokenizerFast
from transformers import DistilBertForQuestionAnswering

checkpoint_path = "/Users/minhdang/Desktop/SEPM-Team24/robustqa/save/baseline-02/checkpoint"
model = DistilBertForQuestionAnswering.from_pretrained(checkpoint_path)
tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")

model.save_pretrained("/Users/minhdang/Desktop/SEPM-Team24/robustqa/robustqa-baseline-01")
tokenizer.save_pretrained("/Users/minhdang/Desktop/SEPM-Team24/robustqa/robustqa-baseline-01")