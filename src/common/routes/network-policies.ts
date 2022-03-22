/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";

export const networkPoliciesRoute: UrlRouteProps = {
  path: "/network-policies",
};

export interface NetworkPoliciesRouteParams {
}

export const networkPoliciesURL = buildURL<NetworkPoliciesRouteParams>(networkPoliciesRoute.path);
