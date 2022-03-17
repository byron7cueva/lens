/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { IPodMetrics, PodSpec } from "./pods.api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import { KubeObject, KubeObjectMetadata, LabelSelector } from "../kube-object";

export interface DaemonSetSpec {
  selector: LabelSelector;
  template: {
    metadata: {
      creationTimestamp?: string;
      labels: {
        name: string;
      };
    };
    spec: PodSpec;
  };
  updateStrategy: {
    type: string;
    rollingUpdate: {
      maxUnavailable: number;
    };
  };
  revisionHistoryLimit: number;
}

export interface DaemonSetStatus {
  currentNumberScheduled: number;
  numberMisscheduled: number;
  desiredNumberScheduled: number;
  numberReady: number;
  observedGeneration: number;
  updatedNumberScheduled: number;
  numberAvailable: number;
  numberUnavailable: number;
}

export class DaemonSet extends KubeObject<KubeObjectMetadata, DaemonSetStatus, DaemonSetSpec, "namespace-scoped"> {
  static kind = "DaemonSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/daemonsets";

  getSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.selector.matchLabels);
  }

  getNodeSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.template.spec.nodeSelector);
  }

  getTemplateLabels(): string[] {
    return KubeObject.stringifyLabels(this.spec.template.metadata.labels);
  }

  getTolerations() {
    return this.spec.template.spec.tolerations ?? [];
  }

  getAffinity() {
    return this.spec.template.spec.affinity;
  }

  getAffinityNumber() {
    return Object.keys(this.getAffinity() ?? {}).length;
  }

  getImages() {
    const containers = this.spec.template?.spec?.containers ?? [];
    const initContainers = this.spec.template?.spec?.initContainers ?? [];

    return [...containers, ...initContainers].map(container => container.image);
  }
}

export class DaemonSetApi extends KubeApi<DaemonSet> {
}

export function getMetricsForDaemonSets(daemonsets: DaemonSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = daemonsets.map(daemonset => `${daemonset.getName()}-[[:alnum:]]{5}`).join("|");
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

/**
 * Only available within kubernetes cluster pages
 */
let daemonSetApi: DaemonSetApi;

if (isClusterPageContext()) {
  daemonSetApi = new DaemonSetApi({
    objectConstructor: DaemonSet,
  });
}

export {
  daemonSetApi,
};
