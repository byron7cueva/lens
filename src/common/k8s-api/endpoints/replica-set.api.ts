/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { DerivedKubeApiOptions, IgnoredKubeApiOptions, KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { PodMetrics } from "./pods.api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import { KubeObject, KubeObjectStatus, LabelSelector } from "../kube-object";
import type { PodTemplateSpec } from "./types/pod-template-spec";

export class ReplicaSetApi extends KubeApi<ReplicaSet> {
  constructor(opts: DerivedKubeApiOptions & IgnoredKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: ReplicaSet,
    });
  }

  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.getUrl(params)}/scale`;
  }

  async getReplicas(params: { namespace: string; name: string }): Promise<number> {
    const { status } = await this.request.get(this.getScaleApiUrl(params));

    return (status as { replicas: number })?.replicas;
  }

  scale(params: { namespace: string; name: string }, replicas: number) {
    return this.request.put(this.getScaleApiUrl(params), {
      data: {
        metadata: params,
        spec: {
          replicas,
        },
      },
    });
  }
}

export function getMetricsForReplicaSets(replicasets: ReplicaSet[], namespace: string, selector = ""): Promise<PodMetrics> {
  const podSelector = replicasets.map(replicaset => `${replicaset.getName()}-[[:alnum:]]{5}`).join("|");
  const opts = { category: "pods", pods: podSelector, namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    memoryUsage: opts,
    fsUsage: opts,
    fsWrites: opts,
    fsReads: opts,
    networkReceive: opts,
    networkTransmit: opts,
  }, {
    namespace,
  });
}

export interface ReplicaSetSpec {
  replicas?: number;
  selector: LabelSelector;
  template?: PodTemplateSpec;
  minReadySeconds?: number;
}

export interface ReplicaSetStatus extends KubeObjectStatus {
  replicas: number;
  fullyLabeledReplicas?: number;
  readyReplicas?: number;
  availableReplicas?: number;
  observedGeneration?: number;
}

export class ReplicaSet extends KubeObject<ReplicaSetStatus, ReplicaSetSpec, "namespace-scoped"> {
  static kind = "ReplicaSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/replicasets";

  getSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.selector.matchLabels);
  }

  getNodeSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.template?.spec?.nodeSelector);
  }

  getTemplateLabels(): string[] {
    return KubeObject.stringifyLabels(this.spec.template?.metadata?.labels);
  }

  getTolerations() {
    return this.spec.template?.spec?.tolerations ?? [];
  }

  getAffinity() {
    return this.spec.template?.spec?.affinity;
  }

  getAffinityNumber() {
    return Object.keys(this.getAffinity() ?? {}).length;
  }

  getDesired() {
    return this.spec.replicas ?? 0;
  }

  getCurrent() {
    return this.status?.availableReplicas ?? 0;
  }

  getReady() {
    return this.status?.readyReplicas ?? 0;
  }

  getImages() {
    const containers = this.spec.template?.spec?.containers ?? [];

    return containers.map(container => container.image);
  }
}

export const replicaSetApi = isClusterPageContext()
  ? new ReplicaSetApi()
  : undefined as never;
