/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";
import type http from "http";
import type httpProxy from "http-proxy";
import type { LensApiResultContentType } from "./router-content-types";
import type { URLSearchParams } from "url";

export type InferParam<
  T extends string,
  PathParams extends Record<string, string>,
> =
  T extends `{${infer P}*}`
    ? PathParams & Record<P, string>
    : T extends `{${infer P}?}`
      ? PathParams & Partial<Record<P, string>>
      : T extends `{${infer P}}`
        ? PathParams & Record<P, string>
        : PathParams;

export type InferParamFromPath<P extends string> =
  P extends `${infer A}/${infer B}`
    ? InferParam<A, InferParamFromPath<B>>
    : InferParam<P, {}>;

export interface LensApiRequest<Path extends string> {
  path: Path;
  payload: unknown;
  params: InferParamFromPath<Path>;
  cluster: Cluster;
  query: URLSearchParams;
  raw: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  };
}

export interface LensApiResult<TResult> {
  statusCode?: number;
  response?: TResult;
  error?: any;
  contentType?: LensApiResultContentType;
  headers?: { [name: string]: string };
  proxy?: httpProxy;
}

export type RouteResponse<TResponse> =
  | LensApiResult<TResponse>
  | void;

export type RouteHandler<TResponse, Path extends string> = (
  request: LensApiRequest<Path>
) => RouteResponse<TResponse> | Promise<RouteResponse<TResponse>>;

export interface BaseRoutePaths<Path extends string> {
  path: Path;
  method: "get" | "post" | "put" | "patch" | "delete";
}

export interface Route<TResponse, Path extends string> extends BaseRoutePaths<Path> {
  handler: RouteHandler<TResponse, Path>;
}

export interface BindHandler<Path extends string> {
  <TResponse>(handler: RouteHandler<TResponse, Path>): Route<TResponse, Path>;
}

export function route<Path extends string>(parts: BaseRoutePaths<Path>): BindHandler<Path> {
  return (handler) => ({
    ...parts,
    handler,
  });
}
