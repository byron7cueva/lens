/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";

export const resourceQuotaRoute: UrlRouteProps = {
  path: "/resourcequotas",
};

export interface ResourceQuotaRouteParams {
}

export const resourceQuotaURL = buildURL<ResourceQuotaRouteParams>(resourceQuotaRoute.path);
