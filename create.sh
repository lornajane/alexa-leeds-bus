#!/bin/bash

rm -f lorna.zip
cd src
zip ../lorna.zip index.js
cd ..

aws s3 cp lorna.zip s3://alexa-lorna/
aws lambda update-function-code --function-name AlexaPing --s3-bucket alexa-lorna --s3-key lorna.zip
