/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { PortForward } from "./functionality/port-forward";
import logger from "../../logger";
import { route } from "../../router/route";

const stopCurrentPortForwardRouteInjectable = getInjectable({
  id: "stop-current-port-forward-route",

  instantiate: () => route({
    method: "delete",
    path: `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`,
  })(async ({ params, query, cluster }) => {
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));
    const portForward = PortForward.getPortforward({
      clusterId: cluster.id, kind: resourceType, name: resourceName,
      namespace, port, forwardPort,
    });

    try {
      await portForward?.stop();

      return { response: { status: true }};
    } catch (error) {
      logger.error("[PORT-FORWARD-ROUTE]: error stopping a port-forward", { namespace, port, forwardPort, resourceType, resourceName });

      return {
        error: {
          message: `error stopping a forward port ${port}`,
        },
      };

    }
  }),

  injectionToken: routeInjectionToken,
});

export default stopCurrentPortForwardRouteInjectable;
