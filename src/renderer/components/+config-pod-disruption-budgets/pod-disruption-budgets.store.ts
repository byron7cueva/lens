/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { pdbApi, PodDisruptionBudget, PodDisruptionBudgetApi } from "../../../common/k8s-api/endpoints/poddisruptionbudget.api";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class PodDisruptionBudgetsStore extends KubeObjectStore<PodDisruptionBudget, PodDisruptionBudgetApi> {
  api = pdbApi;
}

export const podDisruptionBudgetsStore = new PodDisruptionBudgetsStore();
apiManager.registerStore(podDisruptionBudgetsStore);
