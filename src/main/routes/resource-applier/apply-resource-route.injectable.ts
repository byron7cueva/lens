/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import type { Route } from "../../router/router";
import { apiPrefix } from "../../../common/vars";
import createK8sResourceApplierInjectable from "../../k8s/resource-applier/create.injectable";

const applyResourceRouteInjectable = getInjectable({
  id: "apply-resource-route",

  instantiate: (di): Route<string> => {
    const createK8sResourceApplier = di.inject(createK8sResourceApplierInjectable);

    return {
      method: "post",
      path: `${apiPrefix}/stack`,

      handler: async ({ cluster, payload }) => ({
        response: await createK8sResourceApplier(cluster).apply(payload),
      }),
    };
  },

  injectionToken: routeInjectionToken,
});

export default applyResourceRouteInjectable;
