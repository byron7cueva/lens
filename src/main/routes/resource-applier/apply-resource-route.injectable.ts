/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { ResourceApplier } from "../../resource-applier";
import { route } from "../../router/route";

const applyResourceRouteInjectable = getInjectable({
  id: "apply-resource-route",

  instantiate: () => route({
    method: "post",
    path: `${apiPrefix}/stack`,
  })(async ({ cluster, payload }) => ({
    response: await new ResourceApplier(cluster).apply(payload),
  })),

  injectionToken: routeInjectionToken,
});

export default applyResourceRouteInjectable;
