/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";

export const volumeClaimsRoute: UrlRouteProps = {
  path: "/persistent-volume-claims",
};

export interface VolumeClaimsRouteParams {
}

export const volumeClaimsURL = buildURL<VolumeClaimsRouteParams>(volumeClaimsRoute.path);
