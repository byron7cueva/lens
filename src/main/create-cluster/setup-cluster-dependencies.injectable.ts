/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { setupClusterDependenciesInjectionToken } from "../../common/cluster/setup-cluster.token";

const setupClusterDependenciesInjectable = getInjectable({
  id: "setup-cluster-dependencies",
  instantiate: () => true,
  injectionToken: setupClusterDependenciesInjectionToken,
});

export default setupClusterDependenciesInjectable;
