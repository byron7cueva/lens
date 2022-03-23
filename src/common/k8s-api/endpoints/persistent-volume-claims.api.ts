/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject, KubeObjectMetadata, LabelSelector, TypedLocalObjecReference } from "../kube-object";
import { IMetrics, metricsApi } from "./metrics.api";
import type { Pod } from "./pods.api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import { object } from "../../utils";

export class PersistentVolumeClaimsApi extends KubeApi<PersistentVolumeClaim> {
}

export function getMetricsForPvc(pvc: PersistentVolumeClaim): Promise<IPvcMetrics> {
  const opts = { category: "pvc", pvc: pvc.getName(), namespace: pvc.getNs() };

  return metricsApi.getMetrics({
    diskUsage: opts,
    diskCapacity: opts,
  }, {
    namespace: opts.namespace,
  });
}

export interface IPvcMetrics {
  diskUsage: IMetrics;
  diskCapacity: IMetrics;
}

export interface ResourceRequirements {
  limits?: Partial<Record<string, string>>;
  requests?: Partial<Record<string, string>>;
}

export interface PersistentVolumeClaimSpec {
  accessModes?: string[];
  dataSource?: TypedLocalObjecReference;
  dataSourceRef?: TypedLocalObjecReference;
  resources?: ResourceRequirements;
  selector?: LabelSelector;
  storageClassName?: string;
  volumeMode?: string;
  volumeName?: string;
}

export interface PersistentVolumeClaimStatus {
  phase: string; // Pending
}

export class PersistentVolumeClaim extends KubeObject<KubeObjectMetadata, PersistentVolumeClaimStatus, PersistentVolumeClaimSpec> {
  static kind = "PersistentVolumeClaim";
  static namespaced = true;
  static apiBase = "/api/v1/persistentvolumeclaims";

  getPods(pods: Pod[]): Pod[] {
    return pods
      .filter(pod => pod.getNs() === this.getNs())
      .filter(pod => (
        pod.getVolumes()
          .filter(volume => volume.persistentVolumeClaim?.claimName === this.getName())
          .length > 0
      ));
  }

  getStorage(): string {
    return this.spec.resources?.requests?.storage ?? "-";
  }

  getMatchLabels(): string[] {
    return object.entries(this.spec.selector?.matchLabels)
      .map(([name, val]) => `${name}:${val}`);
  }

  getMatchExpressions() {
    return this.spec.selector?.matchExpressions ?? [];
  }

  getStatus(): string {
    return this.status?.phase ?? "-";
  }
}

let pvcApi: PersistentVolumeClaimsApi;

if (isClusterPageContext()) {
  pvcApi = new PersistentVolumeClaimsApi({
    objectConstructor: PersistentVolumeClaim,
  });
}

export {
  pvcApi,
};
