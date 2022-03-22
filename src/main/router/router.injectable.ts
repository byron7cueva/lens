/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { Router } from "./router";
import parseRequestInjectable from "./parse-request.injectable";
import type { Route } from "./route";

export const routeInjectionToken = getInjectionToken<Route<any, string>>({
  id: "route-injection-token",
});

const routerInjectable = getInjectable({
  id: "router",

  instantiate: (di) => {
    const routes = di.injectMany(routeInjectionToken);

    return new Router(routes, {
      parseRequest: di.inject(parseRequestInjectable),
    });
  },
});

export default routerInjectable;
