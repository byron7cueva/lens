/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Cluster, ClusterDependencies } from "../../common/cluster/cluster";
import directoryForKubeConfigsInjectable from "../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import readFileSyncInjectable from "../../common/fs/read-file-sync.injectable";
import baseLoggerInjectable from "../../common/logger/logger.injectable";

const createClusterInjectable = getInjectable({
  id: "create-cluster",

  instantiate: (di) => {
    const dependencies: ClusterDependencies = {
      directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
      createKubeconfigManager: () => { throw new Error("Tried to access back-end feature in front-end."); },
      createKubectl: () => { throw new Error("Tried to access back-end feature in front-end.");},
      createContextHandler: () => { throw new Error("Tried to access back-end feature in front-end."); },
      createAuthorizationReview: () => { throw new Error("Tried to access back-end feature in front-end."); },
      createListNamespaces: () => { throw new Error("Tried to access back-end feature in front-end."); },
      readFileSync: di.inject(readFileSyncInjectable),
      logger: di.inject(baseLoggerInjectable),
      setupCluster: false,
    };

    return (model) => new Cluster(dependencies, model);
  },

  injectionToken: createClusterInjectionToken,
});

export default createClusterInjectable;
