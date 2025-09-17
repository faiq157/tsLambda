#!/bin/bash

cd $BITBUCKET_CLONE_DIR/NC-to-DB
npm ci
npm run lint
if [[ $? -eq 0 ]]; then
 echo "Lint is passed"
 else
 echo "Lint check failed"
 curl -X POST -u $BB_AUTH_USER:$BB_AUTH_STRING -H "Content-Type: application/json" https://api.bitbucket.org/2.0/repositories/terratrak/$BITBUCKET_REPO_SLUG/commit/$BITBUCKET_COMMIT/statuses/build --data "{ \"state\": \"FAILED\", \"key\": \"Test Case Status\" , \"name\": \"Test case Build Status\", \"url\": \"https://bitbucket.org/terratrak/ts-lambda/addon/pipelines/home#!/results/$BITBUCKET_BUILD_NUMBER\", \"description\": \"LINT is failed\" }"
 exit 1
fi

