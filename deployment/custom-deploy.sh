#!/bin/bash

function run_cmd() {
      cmd=$1
       eval $cmd
       if [[ $? -eq 0 ]]; then
        return
       fi

      echo "Failed to execute $cmd"
      exit 1
}

#This 'remote_func_arr' contains all the AWS remote lambda functions 
remote_func_arr=()
           export AWS_REGION=us-east-2
           for i in `aws lambda list-functions --query 'Functions[].FunctionName' --output text`
           do
           remote_func_arr+=($i);
           done

#This 'functions_arr' contains all the Lambda functions in the repository
functions_arr=()
cd $BITBUCKET_CLONE_DIR
for i in `ls -d */ | cut -f1 -d'/'`
do
    if ! printf '%s\n' "${remote_func_arr[@]}" | grep -qFx -- "$i$ENV"; then
            echo "WARNING..!! Lambda function not exist which u want to update"
       continue
     fi
    functions_arr+=($i);
done

arr_length="${#functions_arr[@]}"
echo -e "\n"


        echo -e "Remote Functions name are: ${remote_func_arr[@]}"
        echo -e "Lambda Functions length is:$arr_length"
        echo -e "Lambda Functions name are:${functions_arr[@]}"

        

#Now lambda functions will deploy one-by-one in below while loop 
    i=0
    while (( $i < $arr_length ))
    do
      lambda=${functions_arr[$i]}

      #Assign the environment to the lambda function. 
      lambda_function="$lambda$ENV"
      echo $lambda_function
     
   export BITBUCKET_COMMIT_SHORT=$(echo $BITBUCKET_COMMIT | cut -c1-7)
   lambda_function_stamp=$lambda_function-$BITBUCKET_COMMIT_SHORT
     
      if [[ $lambda == "NC-to-DB" ]]; then
            source $BITBUCKET_CLONE_DIR/deployment/NC-to-DB.sh

          else
            cd $BITBUCKET_CLONE_DIR/$lambda
            npm ci --production

      if [[ $lambda == "Cloud_Intelligence" ]]; then
        run_cmd "aws s3 cp s3://$AWS_S3_BUCKET/keys/private.key certs/private.key"
      fi

   run_cmd "zip -r $lambda_function_stamp.zip ./*"
   run_cmd "aws s3 cp $lambda_function_stamp.zip s3://$AWS_S3_BUCKET/$S3_BUCKET_ENV/$lambda/"
            cd ..
          fi

  run_cmd "aws lambda update-function-code --function-name $lambda_function --s3-bucket $AWS_S3_BUCKET --s3-key $S3_BUCKET_ENV/$lambda/$lambda_function_stamp.zip"
     
     i=`expr $i+1`
    
    done

