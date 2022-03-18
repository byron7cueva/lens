/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { getHostedClusterId } from "../utils";
import clusterStoreInjectable from "./cluster-store.injectable";

const hostedClusterInjectable = getInjectable({
  id: "hosted-cluster",

  instantiate: (di) => {
    const hostedClusterId = getHostedClusterId();
    const cluster = di.inject(clusterStoreInjectable).getById(hostedClusterId);

    // It is an error is inject this when it is not true. So emit a better error message
    assert(cluster, "Using the hostedCluster is only supported within cluster frames");

    return cluster;
  },
});

export default hostedClusterInjectable;
