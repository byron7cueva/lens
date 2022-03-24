/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata } from "../../../../extensions/renderer-api/k8s-api";
import type { JobSpec } from "../job.api";

export interface JobTemplateSpec {
  metadata?: KubeObjectMetadata<"namespace-scoped">;
  spec?: JobSpec;
}
