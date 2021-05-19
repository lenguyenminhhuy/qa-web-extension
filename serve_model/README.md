# HOW TO RUN THE MODEL WITH TORCH SERVER

Follow the steps below to run the model with torchserve
```
0. Install torch-model-archiver and torchserve
https://github.com/pytorch/serve/blob/master/README.md#install-torchserve

0.1. Generate certificate using mkcert
brew install mkcert
mkcert -install
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost

0.2. Copy the localhost-key.pem and localhost.pem to keys folder

1. Save the model
model.save_pretrained("./model")

2. Save the tokenizer
tokenizer.save_pretrained("./model")

3. Create model_store folder

4. Create `.mar` file from `model` folder 
torch-model-archiver --model-name BERT_QA --version 1.0 --serialized-file model/pytorch_model.bin --handler ./Transformer_handler_generalized.py --extra-files "model/config.json,./setup_config.json,./model/vocab.txt,./model/special_tokens_map.json,./model/tokenizer_config.json,./model/training_args.bin"

5. move the .mar file into the `model_store`
mv BERT_QA.mar model_store/

5. Build image and Run the container
docker build -t mii/serve-model:0.1 . 

docker run  -v keys:/app/keys mii/serve-model:0.1
```