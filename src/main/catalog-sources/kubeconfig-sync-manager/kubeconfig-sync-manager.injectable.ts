/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import { KubeconfigSyncManager } from "./kubeconfig-sync-manager";
import { createClusterInjectionToken } from "../../../common/cluster/create-cluster-injection-token";
import { ClusterManager } from "../../cluster-manager";
import { ClusterStore } from "../../../common/cluster-store/cluster-store";

const kubeconfigSyncManagerInjectable = getInjectable({
  id: "kubeconfig-sync-manager",

  instantiate: (di) => new KubeconfigSyncManager({
    directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
    createCluster: di.inject(createClusterInjectionToken),
    // TODO: make injectable
    deleting: ClusterManager.getInstance().deleting,
    getClusterById: (id) => ClusterStore.getInstance().getById(id),
  }),
});

export default kubeconfigSyncManagerInjectable;
