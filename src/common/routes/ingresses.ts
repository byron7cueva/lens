/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";

export const ingressRoute: UrlRouteProps = {
  path: "/ingresses",
};

export interface IngressRouteParams {
}

export const ingressURL = buildURL<IngressRouteParams>(ingressRoute.path);
