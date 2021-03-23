#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { LearningSeriesStack } from "./LearningSeriesStack";

const app = new App();

new LearningSeriesStack(app, "LearningSeriesStack");
