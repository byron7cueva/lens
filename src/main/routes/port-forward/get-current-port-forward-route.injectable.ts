/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { PortForward } from "./functionality/port-forward";
import { route } from "../../router/route";

const getCurrentPortForwardRouteInjectable = getInjectable({
  id: "get-current-port-forward-route",

  instantiate: () => route({
    method: "get",
    path: `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`,
  })(async ({ params, query, cluster }) => {
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));

    const portForward = PortForward.getPortforward({
      clusterId: cluster.id, kind: resourceType, name: resourceName,
      namespace, port, forwardPort,
    });

    return {
      response: {
        port: portForward?.forwardPort ?? null,
      },
    };
  }),

  injectionToken: routeInjectionToken,
});

export default getCurrentPortForwardRouteInjectable;
