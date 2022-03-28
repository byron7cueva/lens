/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";
import { helmRoute } from "./helm";

export const releaseRoute: UrlRouteProps = {
  path: `${helmRoute.path}/releases/:namespace?/:name?`,
};

export interface ReleaseRouteParams {
  name?: string;
  namespace?: string;
}

export const releaseURL = buildURL<ReleaseRouteParams>(releaseRoute.path);
