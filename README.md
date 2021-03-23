# CDK-learning-series
A learning series talk on my experience building infrastructure with AWS CDK

## Part 1: How it works

### Project Structure
```
.
|-- cdk.json // The configuration settings of the application:
|-- src
|   `-- bin
|       `-- cdk.ts // The entry point of your CDK application 
|-- tsconfig.base.json // Provides the typescript rules for the project.
`-- tsconfig.json // Extends `typescript.base.json` to use project rules and applies it to a src location
```

### Deploying a CDK app
When invoking `cdk deploy` in the command line. The CLI will use the features defined in your `cdk.json` under `context` you can learn more about [here](https://github.com/aws/aws-cdk/blob/master/packages/@aws-cdk/cx-api/lib/features.ts)
The CDK will invoke the command that is defined on the `app` property in our case using `ts-node` as an executable to run our cdk app located at the entry point
`src/bin/cdk.ts`. It will deploy by using your aws credentials located in `~/.aws/credentials` 

#### Bootstrapping

This process only occurs under certain criteria depending on where this application
is being deployed to. You can find out more about this [here](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html)

#### Output
You will notice a `cdk.out` directory that is created when running `cdk deploy`. This is the cloud formation templates that are generated as part of this workflow
We have created a FooStack, which will hold the scope of our Cloudformation constructs

![Stack we created](docs/project.png)

### Additional information on CDK basics
[learn more here](https://docs.aws.amazon.com/cdk/latest/guide/apps.html)