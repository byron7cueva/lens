/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { JsonApi, JsonApiData, JsonApiError } from "./json-api";
import type { Response } from "node-fetch";
import { LensProxy } from "../../main/lens-proxy";
import { apiKubePrefix, isDebugging } from "../vars";
import type { KubeObjectMetadata } from "./kube-object";

export interface KubeJsonApiListMetadata {
  resourceVersion: string;
  selfLink?: string;
}

export interface KubeJsonApiDataList<T = KubeJsonApiData> {
  kind: string;
  apiVersion: string;
  items: T[];
  metadata: KubeJsonApiListMetadata;
}

export interface KubeJsonApiData<
  Metadata extends KubeObjectMetadata = KubeObjectMetadata,
  Status = unknown,
  Spec = unknown,
> extends JsonApiData {
  kind: string;
  apiVersion: string;
  metadata: Metadata;
  status?: Status;
  spec?: Spec;
}

export interface KubeJsonApiError extends JsonApiError {
  code: number;
  status: string;
  message?: string;
  reason: string;
  details: {
    name: string;
    kind: string;
  };
}

export class KubeJsonApi extends JsonApi<KubeJsonApiData> {
  static forCluster(clusterId: string): KubeJsonApi {
    const port = LensProxy.getInstance().port;

    return new this({
      serverAddress: `http://127.0.0.1:${port}`,
      apiBase: apiKubePrefix,
      debug: isDebugging,
    }, {
      headers: {
        "Host": `${clusterId}.localhost:${port}`,
      },
    });
  }

  protected parseError(error: KubeJsonApiError | any, res: Response): string[] {
    const { status, reason, message } = error;

    if (status && reason) {
      return [message || `${status}: ${reason}`];
    }

    return super.parseError(error, res);
  }
}
