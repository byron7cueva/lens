/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject, KubeObjectMetadata } from "../kube-object";
import type { KubeJsonApiData } from "../kube-json-api";
import { DerivedKubeApiOptions, KubeApi } from "../kube-api";
import { autoBind } from "../../utils";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface ConfigMapData extends KubeJsonApiData<KubeObjectMetadata, void, void> {
  data?: Partial<Record<string, string>>;
  binaryData?: Partial<Record<string, string>>;
  immutable?: boolean;
}

export class ConfigMap extends KubeObject<void, void, "namespace-scoped"> {
  static kind = "ConfigMap";
  static namespaced = true;
  static apiBase = "/api/v1/configmaps";

  data: Partial<Record<string, string>>;
  binaryData: Partial<Record<string, string>>;
  immutable?: boolean;

  constructor({ data, binaryData, immutable, ...rest }: ConfigMapData) {
    super(rest);
    autoBind(this);

    this.data = data ?? {};
    this.binaryData = binaryData ?? {};
    this.immutable = immutable;
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }
}

export class ConfigMapApi extends KubeApi<ConfigMap, ConfigMapData> {
  constructor(opts?: DerivedKubeApiOptions) {
    super({
      objectConstructor: ConfigMap,
      ...opts ?? {},
    });
  }
}

export const configMapApi = isClusterPageContext()
  ? new ConfigMapApi()
  : undefined as never;
