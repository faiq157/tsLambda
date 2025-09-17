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
           export AWS_REGION=$AWS_DEFAULT_REGION
           for i in `aws lambda list-functions --query 'Functions[].FunctionName' --output text`
           do
           remote_func_arr+=($i);
           done

#This 'functions_arr' contains all the Lambda functions in the repository
functions_arr=()
directories_arr=()
cd $BITBUCKET_CLONE_DIR
for i in `ls -d */ | cut -f1 -d'/'`
do
    a=$(echo "${i,,}" | sed 's/\_/-/g') 
    if ! printf '%s\n' "${remote_func_arr[@]}" | grep -qFx -- "$ENV_PREFIX-terratrak-$a"; then
            echo "WARNING..!! Lambda function not exist which u want to update"
       continue
     fi
    directories_arr+=($i);
    functions_arr+=($a);
done

arr_length="${#functions_arr[@]}"
dir_length="${#directories_arr[@]}"
echo -e "\n"


        echo -e "Remote Functions name are: ${remote_func_arr[@]}"
        echo -e "Lambda Functions length is:$arr_length"
        echo -e "Lambda Functions name are:${functions_arr[@]}"
        echo -e "Directories length is:$dir_length"
        echo -e "Directories names are:${directories_arr[@]}"
        

#Now lambda functions will deploy one-by-one in below while loop 
    i=0
    while (( $i < $arr_length ))
    do
      lambda=${functions_arr[$i]}
      lambda_dir=${directories_arr[$i]}

      #Assign the environment to the lambda function. 
      lambda_function="$ENV_PREFIX-terratrak-$lambda"
      echo $lambda_function
     
   export BITBUCKET_COMMIT_SHORT=$(echo $BITBUCKET_COMMIT | cut -c1-7)
   lambda_function_stamp=$lambda_function-$BITBUCKET_COMMIT_SHORT
     
      if [[ $lambda_dir == "NC-to-DB" ]]; then
            source $BITBUCKET_CLONE_DIR/terraform/NC-to-DB.sh

          else
            cd $BITBUCKET_CLONE_DIR/$lambda_dir
            npm ci --production

      if [[ $lambda_dir == "Cloud_Intelligence" ]]; then
        run_cmd "aws s3 cp s3://$ENVIRONMENT.terratrak.com/certs/server-iot/private.$ENV_PREFIX.key certs/private.$ENV_PREFIX.key"
      fi

   run_cmd "zip -r $lambda_function_stamp.zip ./*"
   run_cmd "aws s3 cp $lambda_function_stamp.zip s3://$ENVIRONMENT.terratrak.com/deployments/lambdas/$lambda/"
            cd ..
          fi

  run_cmd "aws lambda update-function-code --function-name $lambda_function --s3-bucket $ENVIRONMENT.terratrak.com --s3-key deployments/lambdas/$lambda/$lambda_function_stamp.zip"
     
     i=`expr $i+1`
    
    done