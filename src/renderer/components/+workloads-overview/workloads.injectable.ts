/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";
import namespaceStoreInjectable from "../+namespaces/namespace-store/namespace-store.injectable";
import { workloads } from "./workloads";
import { object } from "../../utils";

const workloadsInjectable = getInjectable({
  id: "workloads",

  instantiate: (di) =>
    workloads({
      isAllowedResource: di.inject(isAllowedResourceInjectable),
      namespaceStore: di.inject(namespaceStoreInjectable),
      workloadStores: object.fromEntries([
        ["pods", podsStore as never],
        ["deployments", deploymentStore as never],
        ["daemonsets", daemonSetStore as never],
        ["statefulsets", statefulSetStore as never],
        ["replicasets", replicaSetStore as never],
        ["jobs", jobStore as never],
        ["cronjobs", cronJobStore as never],
      ]),
    }),
});

export default workloadsInjectable;
