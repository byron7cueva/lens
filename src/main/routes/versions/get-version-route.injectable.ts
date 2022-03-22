/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import { getAppVersion } from "../../../common/utils";
import { route } from "../../router/route";

const getVersionRouteInjectable = getInjectable({
  id: "get-version-route",

  instantiate: () => route({
    method: "get",
    path: `/version`,
  })(() => ({
    response: {
      version: getAppVersion(),
    },
  })),

  injectionToken: routeInjectionToken,
});

export default getVersionRouteInjectable;
