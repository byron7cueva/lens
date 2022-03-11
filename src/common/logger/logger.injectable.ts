/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import logger, { LensLogger } from "../logger";

const baseLoggerInjectable = getInjectable({
  id: "base-logger",
  instantiate: (): LensLogger => logger,
});

export default baseLoggerInjectable;
