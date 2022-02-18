/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../../routes/all-routes.injectable";
import { ClusterRoles } from "./view";
import isAllowedResourceInjectable from "../../../../common/utils/is-allowed-resource.injectable";
import userManagementRouteInjectable from "../user-management-route.injectable";

const clusterRolesRouteInjectable = getInjectable({
  id: "cluster-roles-route",

  instantiate: (di) => {
    const isAllowedResource = di.inject(isAllowedResourceInjectable);

    return {
      title: "Cluster Roles",
      icon: "apps",
      parent: di.inject(userManagementRouteInjectable),
      path: "/cluster-roles",
      Component: ClusterRoles,
      clusterFrame: true,
      mikko: () => isAllowedResource("clusterroles"),
    };
  },

  injectionToken: routeInjectionToken,
});

export default clusterRolesRouteInjectable;
