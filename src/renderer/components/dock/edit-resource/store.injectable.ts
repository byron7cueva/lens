/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { EditResourceTabStore } from "./store";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import { apiKube } from "../../../api";

const editResourceTabStoreInjectable = getInjectable({
  id: "edit-resource-tab-store",

  instantiate: (di) => new EditResourceTabStore({
    createStorage: di.inject(createStorageInjectable),
    apiKube, // TODO: make injectable
  }),
});

export default editResourceTabStoreInjectable;
