/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";
import { helmRoute } from "./helm";

export const helmChartsRoute: UrlRouteProps = {
  path: `${helmRoute.path}/charts/:repo?/:chartName?`,
};

export interface HelmChartsRouteParams {
  chartName?: string;
  repo?: string;
}

export const helmChartsURL = buildURL<HelmChartsRouteParams>(helmChartsRoute.path);
