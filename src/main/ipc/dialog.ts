/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { dialog, OpenDialogOptions } from "electron";
import { WindowManager } from "../window-manager";

export async function showOpenDialog(dialogOptions: OpenDialogOptions): Promise<{ canceled: boolean; filePaths: string[] }> {
  const window = await WindowManager.getInstance().ensureMainWindow();
  const { canceled, filePaths } = await dialog.showOpenDialog(window, dialogOptions);

  return { canceled, filePaths };
}
