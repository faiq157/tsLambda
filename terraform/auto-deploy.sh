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

modify_func_arr=()
directories_arr=()

#This 'remote_func_arr' contains all the AWS remote lambda functions 
remote_func_arr=()
           export AWS_REGION=$AWS_DEFAULT_REGION
           for i in `aws lambda list-functions --query 'Functions[].FunctionName' --output text`
           do
           remote_func_arr+=($i);
           done

#Bitbucket api used to find the modified files in repo 
result=`curl -u ${BB_AUTH_USER}:${BB_AUTH_STRING} https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_OWNER}/${BITBUCKET_REPO_SLUG}/diffstat/${BITBUCKET_COMMIT}`
          #echo $result
           len=`echo $result | jq '.size'`

           for (( i=0; i<$len; i++ )) do
           status=`echo $result | jq '.values['$i'].status'`
           final_status=$(echo $status|tr -d '"')
           #echo $final_status

            if [[ $final_status == "removed" ]]; then
             echo "WARNING...! You have deleted some file(s)" 
             path=`echo $result | jq '.values['$i'].old.path'`
            else
             path=`echo $result | jq '.values['$i'].new.path'`
            fi


          # echo $path 
           final_path=$(echo $path|tr -d '"')
           function=${final_path%%/*}
           functions+=($function)
      
           done

       
#This 'modify_func_arr' array contains a function names by excluding the complete path   
	  for i in `echo "${functions[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '`
	  do
      a=$(echo "${i,,}" | sed 's/\_/-/g')
      directories_arr+=($i);
		  modify_func_arr+=($a)
	  done 

	  
          arr_length="${#modify_func_arr[@]}"
          dir_length="${#directories_arr[@]}"
	 
        echo -e "Remote Functions name are: ${remote_func_arr[@]}"
        echo -e "Modified Functions length is:$arr_length"
        echo -e "Modified Functions name are:${modify_func_arr[@]}"
        echo -e "Directories length is:$dir_length"
        echo -e "Directories names are:${directories_arr[@]}"
        

#Now lambda functions will deploy one-by-one in below while loop 
    i=0
    while (( $i < $arr_length ))
    do
      lambda=${modify_func_arr[$i]}
      lambda_dir=${directories_arr[$i]}

      #Assign the environment to the lambda function. 
      lambda_function="$ENV_PREFIX-terratrak-$lambda"
      echo $lambda_function

      if ! printf '%s\n' "${remote_func_arr[@]}" | grep -qFx -- "$lambda_function"; then
            echo "WARNING..!! Lambda function not exist which u want to update"
            i=`expr $i+1`
       continue
     fi
     
   export BITBUCKET_COMMIT_SHORT=$(echo $BITBUCKET_COMMIT | cut -c1-7)
   lambda_function_stamp=$lambda_function-$BITBUCKET_COMMIT_SHORT
     
      if [[ $lambda_dir == "NC-to-DB" ]]; then
            source $BITBUCKET_CLONE_DIR/terraform/NC-to-DB.sh

          else
            if [ ! -d "$lambda_dir" ]; then
            i=`expr $i+1`
            echo "WARNING...! Lambda directory doesn't exist to deploy"
            continue;
            fi
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