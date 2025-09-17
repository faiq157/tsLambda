#!/bin/bash

cd $BITBUCKET_CLONE_DIR/$lambda
rm -rf dist && mkdir dist
cp package*.json dist && cd dist && npm ci --production && cd ..
cd dist
aws s3 cp s3://ts-mqtt-certs/private.key certs/private.key
cd ..
cp -r models protobuf services utils certs *.pem *.js dist
cd dist

zip -r $lambda_function_stamp.zip ./*
run_cmd "aws s3 cp $lambda_function_stamp.zip s3://$AWS_S3_BUCKET/$S3_BUCKET_ENV/$lambda/"

cd ../../