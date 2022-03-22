/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL, UrlRouteProps } from "../utils/buildUrl";

export const secretsRoute: UrlRouteProps = {
  path: "/secrets",
};

export interface SecretsRouteParams {
}

export const secretsURL = buildURL(secretsRoute.path);
