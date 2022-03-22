/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { compile } from "path-to-regexp";
import type { RouteProps } from "react-router";
import { isDefined } from "./type-narrowing";

export interface UrlRouteProps extends RouteProps {
  path: string;
}

export interface URLParams<P extends object = {}, Q extends object = {}> {
  params?: P;
  query?: Q;
  fragment?: string;
}

export function buildURL<P extends object = {}, Q extends object = {}>(path: string | any) {
  const pathBuilder = compile(String(path));

  return function ({ params, query, fragment }: URLParams<P, Q> = {}): string {
    const queryParams = query ? new URLSearchParams(Object.entries(query)).toString() : "";
    const parts = [
      pathBuilder(params),
      queryParams && `?${queryParams}`,
      fragment && `#${fragment}`,
    ];

    return parts.filter(isDefined).join("");
  };
}

export function buildURLPositional<P extends object = {}, Q extends object = {}>(path: string | any) {
  const builder = buildURL(path);

  return function (params?: P, query?: Q, fragment?: string): string {
    return builder({ params, query, fragment });
  };
}
