/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";

export const volumesRoute: UrlRouteProps = {
  path: "/persistent-volumes",
};

export interface VolumesRouteParams {
}

export const volumesURL = buildURL<VolumesRouteParams>(volumesRoute.path);
