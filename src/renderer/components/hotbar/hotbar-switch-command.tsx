/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import hotbarManagerInjectable from "../../../common/hotbar-store.injectable";
import type { CommandOverlay } from "../command-palette";
import { HotbarAddCommand } from "./hotbar-add-command";
import { HotbarRemoveCommand } from "./hotbar-remove-command";
import { HotbarRenameCommand } from "./hotbar-rename-command";
import type { Hotbar } from "../../../common/hotbar-types";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";

const hotbarAddAction = Symbol("hotbar-add");
const hotbarRemoveAction = Symbol("hotbar-remove");
const hotbarRenameAction = Symbol("hotbar-rename");

interface HotbarManager {
  hotbars: Hotbar[];
  setActiveHotbar: (hotbar: Hotbar) => void;
  getDisplayLabel: (hotbar: Hotbar) => string;
}

interface Dependencies {
  hotbarManager: HotbarManager;
  commandOverlay: CommandOverlay;
}

function ignoreIf<T>(check: boolean, menuItems: T) {
  return check ? [] : menuItems;
}

function getHotbarSwitchOptions(hotbars: Hotbar[]): (Hotbar | typeof hotbarAddAction | typeof hotbarRemoveAction | typeof hotbarRenameAction)[] {
  return [
    ...hotbars,
    hotbarAddAction,
    ...ignoreIf(hotbars.length > 1, [
      hotbarRemoveAction,
    ] as const),
    hotbarRenameAction,
  ];
}

const NonInjectedHotbarSwitchCommand = observer(({ hotbarManager, commandOverlay }: Dependencies) => {
  return (
    <Select
      menuPortalTarget={null}
      onChange={(value) => {
        switch(value) {
          case hotbarAddAction:
            return commandOverlay.open(<HotbarAddCommand />);
          case hotbarRemoveAction:
            return commandOverlay.open(<HotbarRemoveCommand />);
          case hotbarRenameAction:
            return commandOverlay.open(<HotbarRenameCommand />);

          default: {
            if (value) {
              hotbarManager.setActiveHotbar(value);
              commandOverlay.close();
            }
          }
        }
      }}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={getHotbarSwitchOptions(hotbarManager.hotbars)}
      getOptionLabel={actionOrId => {
        switch(actionOrId) {
          case hotbarAddAction:
            return "Add hotbar ...";
          case hotbarRemoveAction:
            return "Remove hotbar ...";
          case hotbarRenameAction:
            return "Rename hotbar ...";
          default:
            return hotbarManager.getDisplayLabel(actionOrId);
        }
      }}
      autoFocus={true}
      escapeClearsValue={false}
      placeholder="Switch to hotbar"
    />
  );
});

export const HotbarSwitchCommand = withInjectables<Dependencies>(NonInjectedHotbarSwitchCommand, {
  getProps: (di, props) => ({
    hotbarManager: di.inject(hotbarManagerInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    ...props,
  }),
});
