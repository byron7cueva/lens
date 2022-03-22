/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { route } from "../../../router/route";

const getReleaseRouteInjectable = getInjectable({
  id: "get-release-route",

  instantiate: () => route({
    method: "get",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}`,
  })(async ({ cluster, params }) => ({
    response: await helmService.getRelease(
      cluster,
      params.release,
      params.namespace,
    ),
  })),

  injectionToken: routeInjectionToken,
});

export default getReleaseRouteInjectable;
