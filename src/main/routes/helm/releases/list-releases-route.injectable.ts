/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { route } from "../../../router/route";

const listReleasesRouteInjectable = getInjectable({
  id: "list-releases-route",

  instantiate: () => route({
    method: "get",
    path: `${apiPrefix}/v2/releases/{namespace?}`,
  })(async ({ cluster, params }) => ({
    response: await helmService.listReleases(cluster, params.namespace),
  })),

  injectionToken: routeInjectionToken,
});

export default listReleasesRouteInjectable;
