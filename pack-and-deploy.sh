#!/bin/sh

MY_BUCKET=node-lambdas-test
REGION=us-east-1
MY_STACK_NAME=node-lambdas-test
echo "About to execute sam build && sam package --output-template-file packaged.yaml --s3-bucket $MY_BUCKET --region $REGION && aws cloudformation deploy --region $REGION --template-file packaged.yaml --stack-name $MY_STACK_NAME --capabilities CAPABILITY_IAM"
sam build && sam package --output-template-file packaged.yaml --s3-bucket $MY_BUCKET --region $REGION && aws cloudformation deploy --region $REGION --template-file packaged.yaml --stack-name $MY_STACK_NAME --capabilities CAPABILITY_IAM