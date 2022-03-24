/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata } from "../../kube-object";
import type { PodSpec } from "../pods.api";

export interface PodTemplateSpec {
  metadata?: KubeObjectMetadata<"namespace-scoped">;
  spec?: PodSpec;
}
