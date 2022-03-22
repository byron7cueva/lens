/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { apiPrefix } from "../../../common/vars";
import { routeInjectionToken } from "../../router/router.injectable";
import { PrometheusProviderRegistry } from "../../prometheus";
import { route } from "../../router/route";

const getMetricProvidersRouteInjectable = getInjectable({
  id: "get-metric-providers-route",

  instantiate: () => route({
    method: "get",
    path: `${apiPrefix}/metrics/providers`,
  })(() => {
    return {
      response: Array.from(
        PrometheusProviderRegistry
          .getInstance()
          .providers
          .values(),
        ({ name, id, isConfigurable }) => ({ name, id, isConfigurable }),
      ),
    };
  }),

  injectionToken: routeInjectionToken,
});

export default getMetricProvidersRouteInjectable;
