#!/bin/bash
set -eo pipefail

# Add an exception for project directory
git config --global --add safe.directory /opt/atlassian/pipelines/agent/build

# Getting all the branches
echo "fetching git branches"
git fetch origin '+refs/heads/*:refs/remotes/origin/*' &> /dev/null

# Sort the branches to get the latest develop branch
arr=()
for i in $(git branch -a | grep "origin/develop/"); do arr+=($i);  done
IFS=$'\n'           ## only word-split on '\n'
arr=( $(printf "%s\n" ${arr[@]} | sort -rV ) )  ## reverse sort
unset IFS
recent_develop=${arr[0]}
echo "Latest develop branch:" $recent_develop
recent_develop=${recent_develop##*/}

# Creating branches from the bitbucket api's
echo "Creating Develop and Release Branches"
curl -X POST -s -u ${BB_AUTH_USER}:${BB_AUTH_STRING} -H 'Content-Type: application/json' https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_OWNER}/${BITBUCKET_REPO_SLUG}/refs/branches -d '{ "'"name"'": "'"develop/${newReleaseVersion}"'", "target": { "'"hash"'": "'"${sourceBranch}"'" } }'
curl -X POST -s -u ${BB_AUTH_USER}:${BB_AUTH_STRING} -H 'Content-Type: application/json' https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_OWNER}/${BITBUCKET_REPO_SLUG}/refs/branches -d '{ "'"name"'": "'"release/${newReleaseVersion}"'", "target": { "'"hash"'": "'"${sourceBranch}"'" } }'

# Generating the pull-request using the bitbucket api
echo "Generating Pull-request"
    response=$(curl --silent https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_OWNER}/${BITBUCKET_REPO_SLUG}/pullrequests \
         -u ${BB_AUTH_USER}:${BB_AUTH_STRING}  \
         --request POST \
         --header 'Content-Type: application/json' \
         --data '{
         "title": "Generating a PR to merge latest develop branch",
         "source": {
             "branch": {
                 "'"name"'": "'"develop/${recent_develop}"'"
             }
         },
         "destination": {
             "branch": {
                 "'"name"'": "'"develop/${newReleaseVersion}"'"
             }
         }
     }')

# Getting the PR-ID of the generated Pull-request
echo "Getting the pull-request ID"
    prid=$(echo $response | jq '.id')
    echo "Pull-request ID: ${prid}"


 # Checking the conditions for the pull-request generation
    if [ "$prid" = "null" ]; then
      echo "There are no new changes"
      exit 0
    elif [ -n "$prid" ]; then
      echo "PR has been generated"
    else
      echo "PR empty response"
      exit 1
    fi


# Merging the pull request using the bitbucket api
 echo "Merging the pull-request"
    state=`curl --silent --output /dev/null -w "%{http_code}" -u ${BB_AUTH_USER}:${BB_AUTH_STRING} -X POST \
    https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_OWNER}/${BITBUCKET_REPO_SLUG}/pullrequests/${prid}/merge`
    echo "$state"


# Checking the merge conflicts
    if [ "$state" -eq 200 ]; then
    echo "Merge is successful"
    else [ "$state" -eq 400 ];
    echo "There are merge conflicts"
    exit 1
    fi