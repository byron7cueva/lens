/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { contentTypes, SupportedFileExtension } from "../router/router-content-types";
import logger from "../logger";
import { routeInjectionToken } from "../router/router.injectable";
import { appName, publicPath } from "../../common/vars";
import path from "path";
import readFileInjectable from "../../common/fs/read-file.injectable";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import httpProxy from "http-proxy";
import { LensApiRequest, route } from "../router/route";

interface ProductionDependencies {
  readFile: (path: string) => Promise<Buffer>;
}

const handleStaticFileInProduction =
  ({ readFile }: ProductionDependencies) =>
    async ({ params }: LensApiRequest<"/{path*}">) => {
      const staticPath = path.resolve(__static);
      let filePath = params.path;

      for (let retryCount = 0; retryCount < 5; retryCount += 1) {
        const asset = path.join(staticPath, filePath);
        const normalizedFilePath = path.resolve(asset);

        if (!normalizedFilePath.startsWith(staticPath)) {
          return { statusCode: 404 };
        }

        try {
          const fileExtension = path
            .extname(asset)
            .slice(1) as SupportedFileExtension;

          const contentType = contentTypes[fileExtension] || contentTypes.txt;

          return { response: await readFile(asset), contentType };
        } catch (err) {
          if (retryCount > 5) {
            logger.error("handleStaticFile:", String(err));

            return { statusCode: 404 };
          }

          filePath = `${publicPath}/${appName}.html`;
        }
      }

      return { statusCode: 404 };
    };

interface DevelopmentDependencies {
  proxy: httpProxy;
}

const handleStaticFileInDevelopment =
  ({ proxy }: DevelopmentDependencies) =>
    ({ raw: { req, res }}: LensApiRequest<"/{path*}">) => {
      if (req.url === "/" || !req.url?.startsWith("/build/")) {
        req.url = `${publicPath}/${appName}.html`;
      }

      proxy.web(req, res, {
        target: "http://127.0.0.1:8080",
      });

      return { proxy };
    };

const staticFileRouteInjectable = getInjectable({
  id: "static-file-route",

  instantiate: (di) => {
    const isDevelopment = di.inject(isDevelopmentInjectable);

    return route({
      method: "get",
      path: `/{path*}`,
    })(
      isDevelopment
        ? handleStaticFileInDevelopment({ proxy: httpProxy.createProxy() })
        : handleStaticFileInProduction({ readFile: di.inject(readFileInjectable) }),
    );
  },

  injectionToken: routeInjectionToken,
});

export default staticFileRouteInjectable;
