## Hot reload on AWS Node Lambdas

### Project structure
The idea is to have a single SAM application project containing one or more Node Lambdas. At the root of the project we have the `template.yaml` file describing the whole application, and the `build` directory which is automatically generated by Webpack (see below). The quirk of this technique is that we *replace* `sam build` with `webpack`, since the latter has a powerful hot reload capability while the former does not.

This explanation is heavily inspired off [this excellent write-up](https://dev.to/elthrasher/managing-multiple-functions-with-aws-sam-and-webpack-1581) by Matt Morgan.

All Lambda Function handlers are located in the `src/handlers` directory, common/utility code can be organized in other subdirectories of the `src` directory.
```
├─ build
├─ node_modules
├─ package.json
├─ template.yaml
├─ tsconfig.json
├─ webpack.config.ts
└─ src
   └─ handlers
      ├─ hello-function-1.ts
      └─ hello-function-2.ts
```

### The `template.yaml` file
The `template.yaml` file looks like this:
```
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Sample set of NodeJS functions

# Enabling CORS just in case (this is bad for production)
Globals:
  Function:
    CodeUri: build/
    Runtime: nodejs12.x
    Timeout: 300
  Api:
    Cors:
      AllowCredentials: false
      AllowHeaders: "'*'"
      AllowMethods: "'GET,PUT,POST'"
      AllowOrigin: "'*'"

Resources:
  Hello1Function:
    Type: AWS::Serverless::Function
    Properties:
      Handler: helloFunction1.handler
      Runtime: nodejs12.x
      MemorySize: 512
      Environment: # More info about Env Vars: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#environment-object
        Variables:
          PARAM1: VALUE
      Events:
        Characters:
          Type: Api # More info about API Event Source: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#api
          Properties:
            Path: /hello1
            Method: get
  Hello2Function:
    Type: AWS::Serverless::Function
    Properties:
      Handler: helloFunction2.handler
      Runtime: nodejs12.x
      MemorySize: 512
      Environment: # More info about Env Vars: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#environment-object
        Variables:
          PARAM1: VALUE
      Events:
        Characters:
          Type: Api # More info about API Event Source: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#api
          Properties:
            Path: /hello2
            Method: get

Outputs:
  # ServerlessRestApi is an implicit API created out of Events key under Serverless::Function
  # Find out more about other implicit resources you can reference within SAM
  # https://github.com/awslabs/serverless-application-model/blob/master/docs/internals/generated_resources.rst#api
  Hello1Api:
    Description: "API Gateway endpoint URL for Prod stage for Hello 1 function"
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello1/"
  Hello1Function:
    Description: "Tryout Lambda Function ARN"
    Value: !GetAtt Hello1Function.Arn
  Hello1FunctionIamRole:
    Description: "Implicit IAM Role created for Hello 1 function"
    Value: !GetAtt Hello1FunctionRole.Arn
  Hello2Api:
    Description: "API Gateway endpoint URL for Prod stage for Hello 2 function"
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello2/"
  Hello2Function:
    Description: "Tryout Lambda Function ARN"
    Value: !GetAtt Hello2Function.Arn
  Hello2FunctionIamRole:
    Description: "Implicit IAM Role created for Hello 2 function"
    Value: !GetAtt Hello2FunctionRole.Arn
```
It declares (among all things):
- global properties that apply to all functions (in this case I set extra-permissive CORS headers on all resources that will be exposed by the API Gateway); the `CodeUri` property is also set globally to the `build` directory, where Webpack will generate the built code for all functions
- a resource for each Lambda Function; within each resource the `Handler` property indicates, from the directory identified by the `CodeUri` property, the location of the handler code for the function
- the desired output of a SAM deployment, in this case REST resources exposed through an API Gateway and mapping to Lambda Functions, and the necessary IAM
roles to make them work within the authorization framework of AWS

### The `tsconfig.json` file

The `tsconfig.json` file looks like this:
```
{
    "compilerOptions": {
      "alwaysStrict": true,
      "module": "commonjs",
      "noImplicitAny": true,
      "target": "es2019"
    }
}
```
Pretty standard, notice how we don't need to set the `watchOptions` section, since Hot Reload will be taken care of by Webpack.

### The `webpack.config.ts` file

The `webpack.config.ts` file looks like this:
```
import { resolve } from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  entry: {
    helloFunction1: './src/handlers/hello-function-1.ts',
    helloFunction2: './src/handlers/hello-function-2.ts'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: resolve(__dirname, 'build'),
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  target: 'node',
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  optimization: {
    minimize: false
  }
};

export default config;
```

The presence of multiple separate elements in the `entry` property tells Webpack that those sources should be bundled into separate output files, which is exactly what we need (our functions are well-separated Lambda Functions after all). The `target: 'node'` bit tells Webpack that the output files will be executed in a NodeJS environment, hence it will not be neecessary to package standard together with the generated artifacts. Finally, the `minimize: false` property within the `optimization` section tells Webpack not to minify output resources: while this can be of course useful for reducing the size of deployment packages, some node modules (e.g. `mysql`, which I used in my POC) do not support minification.

### Testing
Matt Morgan's article covers testing as well, but right now I can't be bothered.

### Hot reload
Finally, hot reload is obtained through the following steps:
1. in a Terminal window, from the root of the project (where the `webpack.config.ts` file is located) run `npx webpack --watch` (or `npx webpack -w`), this will trigger the first Webpack build, and a new build every time the source code changes
2. in another Terminal window, from the same location, run `sam local start-api`

Each time a `.ts` source file is updated, Webpack will immediately trigger a new build, thus generating new files in the `build` directory; the `sam local start-api` will then serve the updated content, since it's not reading from the `.aws-sam` directory (which would only update a `sam build`) but rather from the `build` directory, which is updated by Webpack. This last bit is important: if a `.aws-sam` directory exists within the project, `sam local start-api` will get the files to serve from there, hence ignoring the files updated by Webpack. It is then necessary to make sure to delete the `.aws-sam` directory if it's there (it's generated by the `sam build` command).

### Deployment
I was able to deploy the whole thing to AWS through the following commands
```
MY_BUCKET=some-bucket
REGION=us-east-1
MY_STACK_NAME=some-stack
npx webpack && sam package --output-template-file packaged.yaml --s3-bucket $MY_BUCKET --region $REGION && aws cloudformation deploy --region $REGION --template-file packaged.yaml --stack-name $MY_STACK_NAME --capabilities CAPABILITY_IAM
```

### Next steps
This is clearly a rough method for obtaining hot reload, probably burning a LOT of resources for a rather simple task. It could be worthwhile experimenting with Webpack instead of using
nodemon.