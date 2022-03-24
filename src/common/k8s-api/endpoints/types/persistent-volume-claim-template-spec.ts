/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata } from "../../kube-object";
import type { PersistentVolumeSpec } from "../persistent-volume.api";

export interface PersistentVolumeClaimTemplateSpec {
  metadata?: KubeObjectMetadata<"cluster-scoped">;
  spec?: PersistentVolumeSpec;
}
