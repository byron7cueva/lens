/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL, URLParams, UrlRouteProps } from "../utils/buildUrl";

// Routes
export const serviceAccountsRoute: UrlRouteProps = {
  path: "/service-accounts",
};
export const podSecurityPoliciesRoute: UrlRouteProps = {
  path: "/pod-security-policies",
};
export const rolesRoute: UrlRouteProps = {
  path: "/roles",
};
export const clusterRolesRoute: UrlRouteProps = {
  path: "/cluster-roles",
};
export const roleBindingsRoute: UrlRouteProps = {
  path: "/role-bindings",
};
export const clusterRoleBindingsRoute: UrlRouteProps = {
  path: "/cluster-role-bindings",
};

export const usersManagementRoute: RouteProps = {
  path: [
    serviceAccountsRoute,
    podSecurityPoliciesRoute,
    roleBindingsRoute,
    clusterRoleBindingsRoute,
    rolesRoute,
    clusterRolesRoute,
  ].map(route => route.path.toString()),
};

// Route params
export interface ServiceAccountsRouteParams {
}

export interface RoleBindingsRouteParams {
}

export interface ClusterRoleBindingsRouteParams {
}

export interface RolesRouteParams {
}

export interface ClusterRolesRouteParams {
}

// URL-builders
export const usersManagementURL = (params?: URLParams) => serviceAccountsURL(params);
export const serviceAccountsURL = buildURL<ServiceAccountsRouteParams>(serviceAccountsRoute.path);
export const podSecurityPoliciesURL = buildURL(podSecurityPoliciesRoute.path);
export const rolesURL = buildURL<RoleBindingsRouteParams>(rolesRoute.path);
export const roleBindingsURL = buildURL<RoleBindingsRouteParams>(roleBindingsRoute.path);
export const clusterRolesURL = buildURL<ClusterRoleBindingsRouteParams>(clusterRolesRoute.path);
export const clusterRoleBindingsURL = buildURL<ClusterRoleBindingsRouteParams>(clusterRoleBindingsRoute.path);
