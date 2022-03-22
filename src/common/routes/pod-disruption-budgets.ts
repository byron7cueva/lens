/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";

export const pdbRoute: UrlRouteProps = {
  path: "/poddisruptionbudgets",
};

export interface PodDisruptionBudgetsRouteParams {
}

export const pdbURL = buildURL<PodDisruptionBudgetsRouteParams>(pdbRoute.path);
