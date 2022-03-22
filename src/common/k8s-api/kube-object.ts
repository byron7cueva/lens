/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Base class for all kubernetes objects

import moment from "moment";
import type { KubeJsonApiData, KubeJsonApiDataList, KubeJsonApiListMetadata } from "./kube-json-api";
import { autoBind, formatDuration, hasOptionalTypedProperty, hasTypedProperty, isObject, isString, isNumber, bindPredicate, isTypedArray, isRecord, json } from "../utils";
import type { ItemObject } from "../item.store";
import { apiKube } from "./index";
import type { JsonApiParams } from "./json-api";
import * as resourceApplierApi from "./endpoints/resource-applier.api";
import type { Patch } from "rfc6902";
import assert from "assert";
import type { JsonObject } from "type-fest";

export type KubeJsonApiDataFor<K extends KubeObject> = K extends KubeObject<infer Metadata, infer Status, infer Spec>
  ? KubeJsonApiData<Metadata, Status, Spec>
  : never;

export interface KubeObjectConstructorData {
  kind?: string;
  namespaced?: boolean;
  apiBase?: string;
}

export type KubeObjectConstructor<K extends KubeObject, Data extends KubeJsonApiDataFor<K> = KubeJsonApiDataFor<K>> = (new (data: Data) => K) & KubeObjectConstructorData;

export interface OwnerReference {
  apiVersion: string;
  kind: string;
  name: string;
  uid: string;
  controller?: boolean;
  blockOwnerDeletion?: boolean;
}

export interface KubeObjectMetadata {
  uid: string;
  name: string;
  namespace?: string;
  creationTimestamp?: string;
  resourceVersion?: string;
  selfLink?: string;
  deletionTimestamp?: string;
  finalizers?: string[];
  continue?: string; // provided when used "?limit=" query param to fetch objects list
  labels?: Record<string, string | undefined>;
  annotations?: Record<string, string | undefined>;
  ownerReferences?: OwnerReference[];
  [key: string]: unknown;
}

export interface KubeStatusData {
  kind: string;
  apiVersion: string;
  code: number;
  message?: string;
  reason?: string;
}

export function isKubeStatusData(object: unknown): object is KubeStatusData {
  return isObject(object)
    && hasTypedProperty(object, "kind", isString)
    && hasTypedProperty(object, "apiVersion", isString)
    && hasTypedProperty(object, "code", isNumber)
    && hasOptionalTypedProperty(object, "message", isString)
    && hasOptionalTypedProperty(object, "reason", isString)
    && object.kind === "Status";
}

export class KubeStatus {
  public readonly kind = "Status";
  public readonly apiVersion: string;
  public readonly code: number;
  public readonly message: string;
  public readonly reason: string;

  constructor(data: KubeStatusData) {
    this.apiVersion = data.apiVersion;
    this.code = data.code;
    this.message = data.message || "";
    this.reason = data.reason || "";
  }
}

export interface BaseKubeObjectCondition {
  /**
   * Last time the condition transit from one status to another.
   *
   * @type Date
   */
  lastTransitionTime?: string;
  /**
   * A human readable message indicating details about last transition.
   */
  message?: string;
  /**
   * brief (usually one word) readon for the condition's last transition.
   */
  reason?: string;
  /**
   * Status of the condition
   */
  status: "True" | "False" | "Unknown";
  /**
   * Type of the condition
   */
  type: string;
}

export interface KubeObjectStatus {
  conditions?: BaseKubeObjectCondition[];
}

export type KubeMetaField = keyof KubeObjectMetadata;

export class KubeCreationError extends Error {
  constructor(message: string, public data: any) {
    super(message);
  }
}

export type LabelMatchExpression = {
  /**
   * The label key that the selector applies to.
   */
  key: string;
} & (
  {
    /**
     * This represents the key's relationship to a set of values.
     */
    operator: "Exists" | "DoesNotExist";
    values?: undefined;
  }
  |
  {
    operator: "In" | "NotIn";
    /**
     * The set of values for to match according to the operator for the label.
     */
    values: string[];
  }
);

export interface Toleration {
  key: string;
  operator: string;
  effect: string;
  value: string;
  tolerationSeconds: number;
}

export interface NodeAffinity {
  nodeSelectorTerms?: LabelSelector[];
  weight: number;
  preference: LabelSelector;
}

export interface PodAffinity {
  labelSelector: LabelSelector;
  topologyKey: string;
}

export interface SpecificAffinity<T> {
  requiredDuringSchedulingIgnoredDuringExecution?: T[];
  preferredDuringSchedulingIgnoredDuringExecution?: T[];
}

export interface Affinity {
  nodeAffinity?: SpecificAffinity<NodeAffinity>;
  podAffinity?: SpecificAffinity<PodAffinity>;
  podAntiAffinity?: SpecificAffinity<PodAffinity>;
}

export interface LabelSelector {
  matchLabels?: Record<string, string | undefined>;
  matchExpressions?: LabelMatchExpression[];
}

export type KubeObjectScope = "namespace-scoped" | "cluster-scoped";
export type GetNamespaceResult<Namespaced extends KubeObjectScope> = (
  Namespaced extends "namespace-scoped"
    ? string
    : Namespaced extends "cluster-scoped"
      ? undefined
      : string | undefined
);

export class KubeObject<Metadata extends KubeObjectMetadata = KubeObjectMetadata, Status = unknown, Spec = unknown, Namespaced extends KubeObjectScope = KubeObjectScope> implements ItemObject {
  static readonly kind?: string;
  static readonly namespaced?: boolean;
  static readonly apiBase?: string;

  apiVersion!: string;
  kind!: string;
  metadata!: Metadata;
  status?: Status;
  spec!: Spec;
  managedFields?: object;

  static create(data: KubeJsonApiData) {
    return new KubeObject(data);
  }

  static isNonSystem(item: KubeJsonApiData | KubeObject) {
    return !item.metadata.name.startsWith("system:");
  }

  static isJsonApiData(object: unknown): object is KubeJsonApiData {
    return (
      isObject(object)
      && hasTypedProperty(object, "kind", isString)
      && hasTypedProperty(object, "apiVersion", isString)
      && hasTypedProperty(object, "metadata", KubeObject.isKubeJsonApiMetadata)
    );
  }

  static isKubeJsonApiListMetadata(object: unknown): object is KubeJsonApiListMetadata {
    return (
      isObject(object)
      && hasOptionalTypedProperty(object, "resourceVersion", isString)
      && hasOptionalTypedProperty(object, "selfLink", isString)
    );
  }

  static isKubeJsonApiMetadata(object: unknown): object is KubeObjectMetadata {
    return (
      isObject(object)
      && hasTypedProperty(object, "uid", isString)
      && hasTypedProperty(object, "name", isString)
      && hasTypedProperty(object, "resourceVersion", isString)
      && hasOptionalTypedProperty(object, "selfLink", isString)
      && hasOptionalTypedProperty(object, "namespace", isString)
      && hasOptionalTypedProperty(object, "creationTimestamp", isString)
      && hasOptionalTypedProperty(object, "continue", isString)
      && hasOptionalTypedProperty(object, "finalizers", bindPredicate(isTypedArray, isString))
      && hasOptionalTypedProperty(object, "labels", bindPredicate(isRecord, isString, isString))
      && hasOptionalTypedProperty(object, "annotations", bindPredicate(isRecord, isString, isString))
    );
  }

  static isPartialJsonApiMetadata(object: unknown): object is Partial<KubeObjectMetadata> {
    return (
      isObject(object)
      && hasOptionalTypedProperty(object, "uid", isString)
      && hasOptionalTypedProperty(object, "name", isString)
      && hasOptionalTypedProperty(object, "resourceVersion", isString)
      && hasOptionalTypedProperty(object, "selfLink", isString)
      && hasOptionalTypedProperty(object, "namespace", isString)
      && hasOptionalTypedProperty(object, "creationTimestamp", isString)
      && hasOptionalTypedProperty(object, "continue", isString)
      && hasOptionalTypedProperty(object, "finalizers", bindPredicate(isTypedArray, isString))
      && hasOptionalTypedProperty(object, "labels", bindPredicate(isRecord, isString, isString))
      && hasOptionalTypedProperty(object, "annotations", bindPredicate(isRecord, isString, isString))
    );
  }

  static isPartialJsonApiData(object: unknown): object is Partial<KubeJsonApiData> {
    return (
      isObject(object)
      && hasOptionalTypedProperty(object, "kind", isString)
      && hasOptionalTypedProperty(object, "apiVersion", isString)
      && hasOptionalTypedProperty(object, "metadata", KubeObject.isPartialJsonApiMetadata)
    );
  }

  static isJsonApiDataList<T>(object: unknown, verifyItem: (val: unknown) => val is T): object is KubeJsonApiDataList<T> {
    return (
      isObject(object)
      && hasTypedProperty(object, "kind", isString)
      && hasTypedProperty(object, "apiVersion", isString)
      && hasTypedProperty(object, "metadata", KubeObject.isKubeJsonApiListMetadata)
      && hasTypedProperty(object, "items", bindPredicate(isTypedArray, verifyItem))
    );
  }

  static stringifyLabels(labels?: Record<string, string | undefined>): string[] {
    if (!labels) return [];

    return Object.entries(labels).map(([name, value]) => `${name}=${value}`);
  }

  /**
   * These must be RFC6902 compliant paths
   */
  private static readonly nonEditablePathPrefixes = [
    "/metadata/managedFields",
    "/status",
  ];
  private static readonly nonEditablePaths = new Set([
    "/apiVersion",
    "/kind",
    "/metadata/name",
    "/metadata/selfLink",
    "/metadata/resourceVersion",
    "/metadata/uid",
    ...KubeObject.nonEditablePathPrefixes,
  ]);

  constructor(data: KubeJsonApiData<Metadata, Status, Spec>) {
    if (typeof data !== "object") {
      throw new TypeError(`Cannot create a KubeObject from ${typeof data}`);
    }

    if (!data.metadata || typeof data.metadata !== "object") {
      throw new KubeCreationError(`Cannot create a KubeObject from an object without metadata`, data);
    }

    Object.assign(this, data);
    autoBind(this);
  }

  get selfLink() {
    return this.metadata.selfLink;
  }

  getId() {
    return this.metadata.uid;
  }

  getResourceVersion() {
    return this.metadata.resourceVersion;
  }

  getDescriptor() {
    const ns = this.getNs();
    const res = ns ? `${ns}/` : "";

    return res + this.getName();
  }

  getName() {
    return this.metadata.name;
  }

  getNs(): GetNamespaceResult<Namespaced> {
    // avoid "null" serialization via JSON.stringify when post data
    return (this.metadata.namespace || undefined) as never;
  }

  /**
   * This function computes the number of milliseconds from the UNIX EPOCH to the
   * creation timestamp of this object.
   */
  getCreationTimestamp() {
    if (!this.metadata.creationTimestamp) {
      return Date.now();
    }

    return new Date(this.metadata.creationTimestamp).getTime();
  }

  /**
   * @deprecated This function computes a new "now" on every call which might cause subtle issues if called multiple times
   *
   * NOTE: Generally you can use `getCreationTimestamp` instead.
   */
  getTimeDiffFromNow(): number {
    if (!this.metadata.creationTimestamp) {
      return 0;
    }

    return Date.now() - new Date(this.metadata.creationTimestamp).getTime();
  }

  /**
   * @deprecated This function computes a new "now" on every call might cause subtle issues if called multiple times
   *
   * NOTE: this function also is not reactive to updates in the current time so it should not be used for renderering
   */
  getAge(humanize = true, compact = true, fromNow = false): string | number {
    if (fromNow) {
      return moment(this.metadata.creationTimestamp).fromNow(); // "string", getTimeDiffFromNow() cannot be used
    }
    const diff = this.getTimeDiffFromNow();

    if (humanize) {
      return formatDuration(diff, compact);
    }

    return diff;
  }

  getFinalizers(): string[] {
    return this.metadata.finalizers || [];
  }

  getLabels(): string[] {
    return KubeObject.stringifyLabels(this.metadata.labels);
  }

  getAnnotations(filter = false): string[] {
    const labels = KubeObject.stringifyLabels(this.metadata.annotations);

    return filter ? labels.filter(label => {
      const skip = resourceApplierApi.annotations.some(key => label.startsWith(key));

      return !skip;
    }) : labels;
  }

  getOwnerRefs() {
    const refs = this.metadata.ownerReferences || [];
    const namespace = this.getNs();

    return refs.map(ownerRef => ({ ...ownerRef, namespace }));
  }

  getSearchFields() {
    const { getName, getId, getNs, getAnnotations, getLabels } = this;

    return [
      getName(),
      getNs(),
      getId(),
      ...getLabels(),
      ...getAnnotations(true),
    ];
  }

  toPlainObject() {
    return json.parse(JSON.stringify(this)) as JsonObject;
  }

  /**
   * @deprecated use KubeApi.patch instead
   */
  async patch(patch: Patch): Promise<KubeJsonApiData | null> {
    for (const op of patch) {
      if (KubeObject.nonEditablePaths.has(op.path)) {
        throw new Error(`Failed to update ${this.kind}: JSON pointer ${op.path} has been modified`);
      }

      for (const pathPrefix of KubeObject.nonEditablePathPrefixes) {
        if (op.path.startsWith(`${pathPrefix}/`)) {
          throw new Error(`Failed to update ${this.kind}: Child JSON pointer of ${op.path} has been modified`);
        }
      }
    }

    return resourceApplierApi.patch(this.getName(), this.kind, this.getNs(), patch);
  }

  /**
   * Perform a full update (or more specifically a replace)
   *
   * Note: this is brittle if `data` is not actually partial (but instead whole).
   * As fields such as `resourceVersion` will probably out of date. This is a
   * common race condition.
   *
   * @deprecated use KubeApi.update instead
   */
  async update(data: Partial<this>): Promise<KubeJsonApiData | null> {
    // use unified resource-applier api for updating all k8s objects
    return resourceApplierApi.update({
      ...this.toPlainObject(),
      ...data,
    });
  }

  /**
   * @deprecated use KubeApi.delete instead
   */
  delete(params?: JsonApiParams) {
    assert(this.selfLink, "selfLink must be present to delete self");

    return apiKube.del(this.selfLink, params);
  }
}
