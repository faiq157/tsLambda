class EnvironmentSupport {

  constructor() {
    // Lambda defines the env var AWS_LAMBDA_FUNCTION_NAME.
    this._runningInLambda = process.env.AWS_LAMBDA_FUNCTION_NAME;
  }

  isLambdaFunction() {
    return this._runningInLambda;
  }

  hasFileSystem() {
    return !this._runningInLambda;
  }

  shouldTerminateDbConnections() {
    // We see connect ETIMEDOUT errors if we terminate db connections while running in lambda
    return !this._runningInLambda;
  }

  shouldDeferBroadcast() {
    return !this._runningInLambda;
  }

  canSendMqttCommands() {
    return !this._runningInLambda;
  }

  getLambdaRootPath(){
    const lambda_root = '/var/task'
    return lambda_root
  }
}

module.exports = new EnvironmentSupport();
