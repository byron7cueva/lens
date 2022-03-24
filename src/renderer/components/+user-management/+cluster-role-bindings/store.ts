/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiManager } from "../../../../common/k8s-api/api-manager";
import { ClusterRoleBinding, ClusterRoleBindingApi, clusterRoleBindingApi, ClusterRoleBindingData } from "../../../../common/k8s-api/endpoints";
import type { Subject } from "../../../../common/k8s-api/endpoints/types/subject";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { HashSet } from "../../../utils";
import { hashClusterRoleBindingSubject } from "./hashers";

export class ClusterRoleBindingsStore extends KubeObjectStore<ClusterRoleBinding, ClusterRoleBindingApi, ClusterRoleBindingData> {
  protected sortItems(items: ClusterRoleBinding[]) {
    return super.sortItems(items, [
      clusterRoleBinding => clusterRoleBinding.kind,
      clusterRoleBinding => clusterRoleBinding.getName(),
    ]);
  }

  async updateSubjects(clusterRoleBinding: ClusterRoleBinding, subjects: Subject[]) {
    return this.update(clusterRoleBinding, {
      roleRef: clusterRoleBinding.roleRef,
      subjects,
    });
  }

  async removeSubjects(clusterRoleBinding: ClusterRoleBinding, subjectsToRemove: Iterable<Subject>) {
    const currentSubjects = new HashSet(clusterRoleBinding.getSubjects(), hashClusterRoleBindingSubject);

    for (const subject of subjectsToRemove) {
      currentSubjects.delete(subject);
    }

    return this.updateSubjects(clusterRoleBinding, currentSubjects.toJSON());
  }
}

export const clusterRoleBindingsStore = new ClusterRoleBindingsStore(clusterRoleBindingApi);
apiManager.registerStore(clusterRoleBindingsStore);
