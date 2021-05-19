FROM pytorch/torchserve:latest

WORKDIR /app

RUN pip install transformers

EXPOSE 5000 8081

CMD ["torchserve", "--start", "--model-store",  "model_store", "--models", "my_tc=BERT_QA.mar"]

COPY model_store ./model_store

COPY config.properties .

COPY keys ./keys




