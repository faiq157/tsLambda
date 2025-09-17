#!/bin/bash

cd $BITBUCKET_CLONE_DIR/$lambda_dir
rm -rf dist && mkdir dist
cp package*.json dist && cd dist && npm ci --production && cd ..
cd dist
aws s3 cp s3://$ENVIRONMENT.terratrak.com/certs/server-iot/private.$ENV_PREFIX.key certs/private.$ENV_PREFIX.key
cd ..
cp -r models protobuf services utils certs v0.* *.pem *.js dist
cd dist

zip -r $lambda_function_stamp.zip ./*
run_cmd "aws s3 cp $lambda_function_stamp.zip s3://$ENVIRONMENT.terratrak.com/deployments/lambdas/$lambda/"

cd ../../