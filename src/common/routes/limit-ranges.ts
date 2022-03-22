/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";

export const limitRangesRoute: UrlRouteProps = {
  path: "/limitranges",
};

export interface LimitRangeRouteParams {
}

export const limitRangeURL = buildURL<LimitRangeRouteParams>(limitRangesRoute.path);
