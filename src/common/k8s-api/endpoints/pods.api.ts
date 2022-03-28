/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { MetricData, metricsApi } from "./metrics.api";
import { DerivedKubeApiOptions, IgnoredKubeApiOptions, KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import { KubeObject, Affinity, Toleration, LocalObjectReference, LabelSelector } from "../kube-object";

export class PodApi extends KubeApi<Pod> {
  constructor(opts: DerivedKubeApiOptions & IgnoredKubeApiOptions = {}) {
    super({
      objectConstructor: Pod,
      ...opts,
    });
  }

  getLogs = async (params: { namespace: string; name: string }, query?: IPodLogsQuery): Promise<string> => {
    const path = `${this.getUrl(params)}/log`;

    return this.request.get(path, { query });
  };
}

export function getMetricsForPods(pods: Pod[], namespace: string, selector = "pod, namespace"): Promise<PodMetricData> {
  const podSelector = pods.map(pod => pod.getName()).join("|");
  const opts = { category: "pods", pods: podSelector, namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    cpuRequests: opts,
    cpuLimits: opts,
    memoryUsage: opts,
    memoryRequests: opts,
    memoryLimits: opts,
    fsUsage: opts,
    fsWrites: opts,
    fsReads: opts,
    networkReceive: opts,
    networkTransmit: opts,
  }, {
    namespace,
  });
}

export interface PodMetricData extends Partial<Record<string, MetricData>> {
  cpuUsage: MetricData;
  memoryUsage: MetricData;
  fsUsage: MetricData;
  fsWrites: MetricData;
  fsReads: MetricData;
  networkReceive: MetricData;
  networkTransmit: MetricData;
  cpuRequests?: MetricData;
  cpuLimits?: MetricData;
  memoryRequests?: MetricData;
  memoryLimits?: MetricData;
}

// Reference: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#read-log-pod-v1-core
export interface IPodLogsQuery {
  container?: string;
  tailLines?: number;
  timestamps?: boolean;
  sinceTime?: string; // Date.toISOString()-format
  follow?: boolean;
  previous?: boolean;
}

export enum PodStatusPhase {
  TERMINATED = "Terminated",
  FAILED = "Failed",
  PENDING = "Pending",
  RUNNING = "Running",
  SUCCEEDED = "Succeeded",
  EVICTED = "Evicted",
}

export interface ContainerPort {
  containerPort: number;
  hostIP?: string;
  hostPort?: number;
  name?: string;
  protocol?: "UDP" | "TCP" | "SCTP";
}

export interface VolumeMount {
  name: string;
  readOnly?: boolean;
  mountPath: string;
  mountPropagation?: string;
  subPath?: string;
  subPathExpr?: string;
}

export interface IPodContainer extends Partial<Record<PodContainerProbe, IContainerProbe>> {
  name: string;
  image: string;
  command?: string[];
  args?: string[];
  ports?: ContainerPort[];
  resources?: {
    limits?: {
      cpu: string;
      memory: string;
    };
    requests?: {
      cpu: string;
      memory: string;
    };
  };
  terminationMessagePath?: string;
  terminationMessagePolicy?: string;
  env?: {
    name: string;
    value?: string;
    valueFrom?: {
      fieldRef?: {
        apiVersion: string;
        fieldPath: string;
      };
      secretKeyRef?: {
        key: string;
        name: string;
      };
      configMapKeyRef?: {
        key: string;
        name: string;
      };
    };
  }[];
  envFrom?: {
    configMapRef?: {
      name: string;
    };
    secretRef?: {
      name: string;
    };
  }[];
  volumeMounts?: VolumeMount[];
  imagePullPolicy?: string;
}

export type PodContainerProbe = "livenessProbe" | "readinessProbe" | "startupProbe";

interface IContainerProbe {
  httpGet?: {
    path?: string;

    /**
     * either a port number or an IANA_SVC_NAME string referring to a port defined in the container
     */
    port: number | string;
    scheme: string;
    host?: string;
  };
  exec?: {
    command: string[];
  };
  tcpSocket?: {
    port: number;
  };
  initialDelaySeconds?: number;
  timeoutSeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

export interface ContainerStateRunning {
  startedAt: string;
}

export interface ContainerStateWaiting {
  reason: string;
  message: string;
}

export interface ContainerStateTerminated {
  startedAt: string;
  finishedAt: string;
  exitCode: number;
  reason: string;
  containerID?: string;
  message?: string;
  signal?: number;
}

/**
 * ContainerState holds a possible state of container. Only one of its members
 * may be specified. If none of them is specified, the default one is
 * `ContainerStateWaiting`.
 */
export interface ContainerState {
  running?: ContainerStateRunning;
  waiting?: ContainerStateWaiting;
  terminated?: ContainerStateTerminated;
}

export interface IPodContainerStatus {
  name: string;
  state?: ContainerState;
  lastState?: ContainerState;
  ready: boolean;
  restartCount: number;
  image: string;
  imageID: string;
  containerID?: string;
  started?: boolean;
}

export interface PodSpecVolume {
  name: string;
  persistentVolumeClaim: {
    claimName: string;
  };
  emptyDir: {
    medium?: string;
    sizeLimit?: string;
  };
  configMap: {
    name: string;
  };
  secret: {
    secretName: string;
    defaultMode: number;
  };
}

export interface HostAlias {
  ip: string;
  hostnames: string[];
}

export interface SELinuxOptions {
  level?: string;
  role?: string;
  type?: string;
  user?: string;
}

export interface SeccompProfile {
  localhostProfile?: string;
  type: string;
}

export interface Sysctl {
  name: string;
  value: string;
}

export interface WindowsSecurityContextOptions {
  labelSelector?: LabelSelector;
  maxSkew: number;
  topologyKey: string;
  whenUnsatisfiable: string;
}

export interface PodSecurityContext {
  fsGroup?: number;
  fsGroupChangePolicy?: string;
  runAsGroup?: number;
  runAsNonRoot?: boolean;
  runAsUser?: number;
  seLinuxOptions?: SELinuxOptions;
  seccompProfile?: SeccompProfile;
  supplementalGroups?: number[];
  sysctls?: Sysctl;
  windowsOptions?: WindowsSecurityContextOptions;
}

export interface TopologySpreadConstraint {

}

export interface PodSpec {
  activeDeadlineSeconds?: number;
  affinity?: Affinity;
  automountServiceAccountToken?: boolean;
  containers?: IPodContainer[];
  dnsPolicy?: string;
  enableServiceLinks?: boolean;
  ephemeralContainers?: unknown[];
  hostAliases?: HostAlias[];
  hostIPC?: boolean;
  hostname?: string;
  hostNetwork?: boolean;
  hostPID?: boolean;
  imagePullSecrets?: LocalObjectReference[];
  initContainers?: IPodContainer[];
  nodeName?: string;
  nodeSelector?: Record<string, string | undefined>;
  overhead?: Record<string, string | undefined>;
  preemptionPolicy?: string;
  priority?: number;
  priorityClassName?: string;
  readinessGates?: unknown[];
  restartPolicy?: string;
  runtimeClassName?: string;
  schedulerName?: string;
  securityContext?: PodSecurityContext;
  serviceAccount?: string;
  serviceAccountName?: string;
  setHostnameAsFQDN?: boolean;
  shareProcessNamespace?: boolean;
  subdomain?: string;
  terminationGracePeriodSeconds?: number;
  tolerations?: Toleration[];
  topologySpreadConstraints?: TopologySpreadConstraint[];
  volumes?: PodSpecVolume[];
}

export interface PodCondition {
  lastProbeTime?: number;
  lastTransitionTime?: string;
  message?: string;
  reason?: string;
  type: string;
  status: string;
}

export interface PodStatus {
  phase: string;
  conditions: PodCondition[];
  hostIP: string;
  podIP: string;
  podIPs?: {
    ip: string;
  }[];
  startTime: string;
  initContainerStatuses?: IPodContainerStatus[];
  containerStatuses?: IPodContainerStatus[];
  qosClass?: string;
  reason?: string;
}

export class Pod extends KubeObject<PodStatus, PodSpec, "namespace-scoped"> {
  static kind = "Pod";
  static namespaced = true;
  static apiBase = "/api/v1/pods";

  getAffinityNumber() {
    return Object.keys(this.getAffinity()).length;
  }

  getInitContainers() {
    return this.spec?.initContainers ?? [];
  }

  getContainers() {
    return this.spec?.containers ?? [];
  }

  getAllContainers() {
    return [...this.getContainers(), ...this.getInitContainers()];
  }

  getRunningContainers() {
    const runningContainerNames = new Set(
      this.getContainerStatuses()
        .filter(({ state }) => state?.running)
        .map(({ name }) => name),
    );

    return this.getAllContainers()
      .filter(({ name }) => runningContainerNames.has(name));
  }

  getContainerStatuses(includeInitContainers = true) {
    const { containerStatuses = [], initContainerStatuses = [] } = this.status ?? {};

    if (includeInitContainers) {
      return [...containerStatuses, ...initContainerStatuses];
    }

    return [...containerStatuses];
  }

  getRestartsCount(): number {
    const { containerStatuses = [] } = this.status ?? {};

    return containerStatuses.reduce((totalCount, { restartCount }) => totalCount + restartCount, 0);
  }

  getQosClass() {
    return this.status?.qosClass || "";
  }

  getReason() {
    return this.status?.reason || "";
  }

  getPriorityClassName() {
    return this.spec?.priorityClassName || "";
  }

  getStatus(): PodStatusPhase {
    const phase = this.getStatusPhase();
    const reason = this.getReason();
    const trueConditionTypes = new Set(this.getConditions()
      .filter(({ status }) => status === "True")
      .map(({ type }) => type));
    const isInGoodCondition = ["Initialized", "Ready"].every(condition => trueConditionTypes.has(condition));

    if (reason === PodStatusPhase.EVICTED) {
      return PodStatusPhase.EVICTED;
    }

    if (phase === PodStatusPhase.FAILED) {
      return PodStatusPhase.FAILED;
    }

    if (phase === PodStatusPhase.SUCCEEDED) {
      return PodStatusPhase.SUCCEEDED;
    }

    if (phase === PodStatusPhase.RUNNING && isInGoodCondition) {
      return PodStatusPhase.RUNNING;
    }

    return PodStatusPhase.PENDING;
  }

  // Returns pod phase or container error if occurred
  getStatusMessage(): string {
    if (this.getReason() === PodStatusPhase.EVICTED) {
      return "Evicted";
    }

    if (this.metadata.deletionTimestamp) {
      return "Terminating";
    }

    return this.getStatusPhase() || "Waiting";
  }

  getStatusPhase() {
    return this.status?.phase;
  }

  getConditions() {
    return this.status?.conditions ?? [];
  }

  getVolumes() {
    return this.spec?.volumes ?? [];
  }

  getSecrets(): string[] {
    return this.getVolumes()
      .filter(vol => vol.secret)
      .map(vol => vol.secret.secretName);
  }

  getNodeSelectors(): string[] {
    return Object.entries(this.spec?.nodeSelector ?? {})
      .map(values => values.join(": "));
  }

  getTolerations() {
    return this.spec?.tolerations ?? [];
  }

  getAffinity(): Affinity {
    return this.spec?.affinity ?? {};
  }

  hasIssues() {
    for (const { type, status } of this.getConditions()) {
      if (type === "Ready" && status !== "True") {
        return true;
      }
    }

    for (const { state } of this.getContainerStatuses()) {
      if (state?.waiting?.reason === "CrashLookBackOff") {
        return true;
      }
    }

    return this.getStatusPhase() !== "Running";
  }

  getLivenessProbe(container: IPodContainer) {
    return this.getProbe(container, "livenessProbe");
  }

  getReadinessProbe(container: IPodContainer) {
    return this.getProbe(container, "readinessProbe");
  }

  getStartupProbe(container: IPodContainer) {
    return this.getProbe(container, "startupProbe");
  }

  private getProbe(container: IPodContainer, field: PodContainerProbe): string[] {
    const probe: string[] = [];
    const probeData = container[field];

    if (!probeData) {
      return probe;
    }

    const {
      httpGet, exec, tcpSocket,
      initialDelaySeconds = 0,
      timeoutSeconds = 0,
      periodSeconds = 0,
      successThreshold = 0,
      failureThreshold = 0,
    } = probeData;

    // HTTP Request
    if (httpGet) {
      const { path = "", port, host = "", scheme } = httpGet;
      const resolvedPort = typeof port === "number"
        ? port
        // Try and find the port number associated witht the name or fallback to the name itself
        : container.ports?.find(containerPort => containerPort.name === port)?.containerPort || port;

      probe.push(
        "http-get",
        `${scheme.toLowerCase()}://${host}:${resolvedPort}${path}`,
      );
    }

    // Command
    if (exec?.command) {
      probe.push(`exec [${exec.command.join(" ")}]`);
    }

    // TCP Probe
    if (tcpSocket?.port) {
      probe.push(`tcp-socket :${tcpSocket.port}`);
    }

    probe.push(
      `delay=${initialDelaySeconds}s`,
      `timeout=${timeoutSeconds}s`,
      `period=${periodSeconds}s`,
      `#success=${successThreshold}`,
      `#failure=${failureThreshold}`,
    );

    return probe;
  }

  getNodeName(): string | undefined {
    return this.spec?.nodeName;
  }

  getSelectedNodeOs(): string | undefined {
    return this.spec?.nodeSelector?.["kubernetes.io/os"] || this.spec?.nodeSelector?.["beta.kubernetes.io/os"];
  }

  getIPs(): string[] {
    const podIPs = this.status?.podIPs ?? [];

    return podIPs.map(value => value.ip);
  }
}

export const podApi = isClusterPageContext()
  ? new PodApi()
  : undefined as never;
