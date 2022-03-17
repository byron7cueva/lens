/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Cluster, ClusterDependencies } from "../../common/cluster/cluster";
import directoryForKubeConfigsInjectable from "../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import createKubeconfigManagerInjectable from "../kubeconfig-manager/create-kubeconfig-manager.injectable";
import createKubectlInjectable from "../kubectl/create-kubectl.injectable";
import createContextHandlerInjectable from "../context-handler/create-context-handler.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import createAuthorizationReviewInjectable from "../../common/cluster/authorization-review.injectable";
import createListNamespacesInjectable from "../../common/cluster/list-namespaces.injectable";
import readFileSyncInjectable from "../../common/fs/read-file-sync.injectable";
import baseLoggerInjectable from "../../common/logger/logger.injectable";
import { setupClusterDependenciesInjectionToken } from "../../common/cluster/setup-cluster.token";

const createClusterInjectable = getInjectable({
  id: "create-cluster",

  instantiate: (di) => {
    const dependencies: ClusterDependencies = {
      directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
      createKubeconfigManager: di.inject(createKubeconfigManagerInjectable),
      createKubectl: di.inject(createKubectlInjectable),
      createContextHandler: di.inject(createContextHandlerInjectable),
      createAuthorizationReview: di.inject(createAuthorizationReviewInjectable),
      createListNamespaces: di.inject(createListNamespacesInjectable),
      readFileSync: di.inject(readFileSyncInjectable),
      logger: di.inject(baseLoggerInjectable),
      setupCluster: di.inject(setupClusterDependenciesInjectionToken),
    };

    return (model) => new Cluster(dependencies, model);
  },

  injectionToken: createClusterInjectionToken,
});

export default createClusterInjectable;
