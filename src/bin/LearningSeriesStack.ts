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

export class LearningSeriesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /*
      holds a reference of an "artifact" that is provided to the relevant constructs to perform
      operations against it
     */
    const sourceArtifact = new Artifact();
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
      The pipeline construct ties the 2 constructs together using Action constructs which are codepipeline wrappers
      that provide the glue to orchestrate these un-opinionated constructs (Repository, BuildProject).
      you can see the usage of the artifact we made earlier how we feed it into the different actions so that each
      action can perform "work against it. In this case we pass the sourceArtifact into the CodeCommitSourceAction
      and it adds the src files to it. The CodeBuild action then receives it as input so it can perform the `ls`
      command to list the files.
    */
    new Pipeline(this, "Pipeline", {
      stages: [
        {
          stageName: "Source",
          actions: [
            new CodeCommitSourceAction({
              actionName: "repository-foo-source",
              output: sourceArtifact,
              repository,
              // When a change occurs in this branch trigger the pipeline
              branch: "main",
            }),
          ],
        },
        {
          stageName: "Build",
          actions: [
            new CodeBuildAction({
              input: sourceArtifact,
              actionName: "do-some-kind-of-build",
              project,
            }),
          ],
        },
      ],
    });
  }
}
