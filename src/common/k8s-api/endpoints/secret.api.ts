/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject, KubeObjectMetadata } from "../kube-object";
import type { KubeJsonApiData } from "../kube-json-api";
import { autoBind } from "../../utils";
import { DerivedKubeApiOptions, KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export enum SecretType {
  Opaque = "Opaque",
  ServiceAccountToken = "kubernetes.io/service-account-token",
  Dockercfg = "kubernetes.io/dockercfg",
  DockerConfigJson = "kubernetes.io/dockerconfigjson",
  BasicAuth = "kubernetes.io/basic-auth",
  SSHAuth = "kubernetes.io/ssh-auth",
  TLS = "kubernetes.io/tls",
  BootstrapToken = "bootstrap.kubernetes.io/token",
}

export interface ISecretRef {
  key?: string;
  name: string;
}

export interface SecretData extends KubeJsonApiData<KubeObjectMetadata, void, void> {
  type: SecretType;
  data?: Partial<Record<string, string>>;
}

export class Secret extends KubeObject<KubeObjectMetadata, void, void, "namespace-scoped"> {
  static kind = "Secret";
  static namespaced = true;
  static apiBase = "/api/v1/secrets";

  type: SecretType;
  data: Partial<Record<string, string>>;

  constructor({ data = {}, type, ...rest }: SecretData) {
    super(rest);
    autoBind(this);

    this.data = data;
    this.type = type;
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }

  getToken() {
    return this.data.token;
  }
}

export class SecretApi extends KubeApi<Secret, SecretData> {
  constructor(options: DerivedKubeApiOptions = {}) {
    super({
      ...options,
      objectConstructor: Secret,
    });
  }
}

export const secretsApi = isClusterPageContext()
  ? new SecretApi()
  : undefined;
