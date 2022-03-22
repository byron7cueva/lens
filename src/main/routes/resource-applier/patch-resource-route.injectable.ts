/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { ResourceApplier } from "../../resource-applier";
import { route } from "../../router/route";
import Joi from "joi";
import type { Patch } from "rfc6902";

interface PatchResourcePayload {
  name: string;
  kind: string;
  patch: Patch;
  ns?: string;
}

const patchResourcePayloadValidator = Joi.object<PatchResourcePayload, true, PatchResourcePayload>({
  name: Joi
    .string()
    .required(),
  kind: Joi
    .string()
    .required(),
  ns: Joi
    .string()
    .optional(),
  patch: Joi
    .array()
    .allow(
      Joi.object({
        op: Joi
          .string()
          .required(),
      }).unknown(true),
    ),
});

const patchResourceRouteInjectable = getInjectable({
  id: "patch-resource-route",

  instantiate: () => route({
    method: "patch",
    path: `${apiPrefix}/stack`,
  })(async ({ cluster, payload }) => {
    const result = patchResourcePayloadValidator.validate(payload);

    if (result.error) {
      return {
        error: result.error,
      };
    }

    return {
      response: await new ResourceApplier(cluster).patch(
        result.value.name,
        result.value.kind,
        result.value.patch,
        result.value.ns,
      ),
    };
  }),

  injectionToken: routeInjectionToken,
});

export default patchResourceRouteInjectable;
