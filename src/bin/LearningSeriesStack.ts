import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-codecommit";
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from "@aws-cdk/aws-codebuild";
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline";
import {
  CodeBuildAction,
  CodeCommitSourceAction,
} from "@aws-cdk/aws-codepipeline-actions";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";

export class LearningSeriesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /*
      holds a reference of an "artifact" that is provided to the relevant constructs to perform
      operations against it
     */
    const sourceArtifact = new Artifact();
    const cloudAssemblyArtifact = new Artifact();
    /*
      Creating a repository with source and a branch has to be done outside of the CDK. So in this case
      we create a cloudformation reference to the repository that was created outside of the CDK instead.
    */
    const repository = Repository.fromRepositoryName(
      this,
      "SrcRepository",
      "foo-repository"
    );
    /*
      This is a basic build project that performs an ls to show that we have the src repository to operate
      against. This is using a different construct than before, its a PipelineProject. It provides
      convenient abstraction when integrating a build into codePipeline.
      Where as using the construct we were using before would require additional configuration to do the same thing.
    */
    const project = new PipelineProject(this, "BuildProject", {
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: ['ls'],
          },
        },
      }),
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_3,
      },
    });

    /*
      The CDK pipeline is a higher level of abstraction over the earlier pipeline construct. It offers the ability to rebuild
      your infrastructure using the synthAction command. Where as before we were manually running cdk deploy in our terminal.
    */
    const pipeline = new CdkPipeline(this, "CdkPipeline", {
      sourceAction: new CodeCommitSourceAction({
        actionName: "repository-foo-source",
        output: sourceArtifact,
        repository,
        // When a change occurs in this branch trigger the pipeline
        branch: "main",
      }),
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        installCommand: "npm ci",
        synthCommand: "./node_modules/.bin/cdk synth",
      }),
      selfMutating: true,
      cloudAssemblyArtifact,
    });
    pipeline.addStage("RunCmd").addActions(
      new CodeBuildAction({
        input: sourceArtifact,
        actionName: "ls",
        project,
      })
    );
  }
}
