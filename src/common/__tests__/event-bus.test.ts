/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { appEventBus, AppEvent } from "../app-event-bus/event-bus";
import { assert, Console } from "console";
import { stdout, stderr } from "process";

console = new Console(stdout, stderr);

describe("event bus tests", () => {
  describe("emit", () => {
    it("emits an event", () => {
      let event: AppEvent | undefined;

      appEventBus.addListener((data) => {
        event = data;
      });

      appEventBus.emit({ name: "foo", action: "bar" });
      assert(event);
      expect(event?.name).toBe("foo");
    });
  });
});
