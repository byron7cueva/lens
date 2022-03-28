/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { Endpoints, EndpointsApi, endpointsApi, EndpointsData } from "../../../common/k8s-api/endpoints/endpoint.api";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class EndpointStore extends KubeObjectStore<Endpoints, EndpointsApi, EndpointsData> {
}

export const endpointStore = new EndpointStore(endpointsApi);
apiManager.registerStore(endpointStore);
