/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import Joi from "joi";
import { route } from "../../../router/route";

interface RollbackReleasePayload {
  revision: number;
}

const rollbackReleasePayloadValidator = Joi.object<RollbackReleasePayload, true, RollbackReleasePayload>({
  revision: Joi
    .number()
    .required(),
});

const rollbackReleaseRouteInjectable = getInjectable({
  id: "rollback-release-route",

  instantiate: () => route({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}/rollback`,
  })(async ({ cluster, params, payload }) => {
    const { release, namespace } = params;
    const result = rollbackReleasePayloadValidator.validate(payload);

    if (result.error) {
      return {
        error: result.error,
      };
    }

    await helmService.rollback(cluster, release, namespace, result.value.revision);

    return undefined;
  }),

  injectionToken: routeInjectionToken,
});

export default rollbackReleaseRouteInjectable;
