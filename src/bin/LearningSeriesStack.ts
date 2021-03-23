import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-codecommit";
import { Project, Source } from "@aws-cdk/aws-codebuild";

export class LearningSeriesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /* A code commit src repository */
    const repository = new Repository(this, "SrcRepository", {
      repositoryName: "foo-source",
    });

    /* A build project that will use the codeCommit repository as a src */
    new Project(this, "BuildProject", {
      source: Source.codeCommit({ repository }),
    });
  }
}
