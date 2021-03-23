#!/usr/bin/env node
import { App, Stack } from "@aws-cdk/core";

const app = new App();

new Stack(app, "LearningSeriesStack");
