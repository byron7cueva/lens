/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";

export const servicesRoute: UrlRouteProps = {
  path: "/services",
};

export interface ServicesRouteParams {
}

export const servicesURL = buildURL<ServicesRouteParams>(servicesRoute.path);
