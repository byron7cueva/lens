/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { memoize, noop } from "lodash/fp";
import { createContainer } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import getValueFromRegisteredChannelInjectable from "./app-paths/get-value-from-registered-channel/get-value-from-registered-channel.injectable";
import loggerInjectable from "../common/logger.injectable";
import { overrideFsWithFakes } from "../test-utils/override-fs-with-fakes";
import observableHistoryInjectable from "./navigation/observable-history.injectable";
import { searchParamsOptions } from "./navigation";
import { createMemoryHistory } from "history";
import { createObservableHistory } from "mobx-observable-history";
import registerIpcChannelListenerInjectable from "./app-paths/get-value-from-registered-channel/register-ipc-channel-listener.injectable";
import focusWindowInjectable from "./ipc-channel-listeners/focus-window.injectable";
import extensionsStoreInjectable from "../extensions/extensions-store/extensions-store.injectable";
import type { ExtensionsStore } from "../extensions/extensions-store/extensions-store";
import fileSystemProvisionerStoreInjectable from "../extensions/extension-loader/create-extension-instance/file-system-provisioner-store/file-system-provisioner-store.injectable";
import type { FileSystemProvisionerStore } from "../extensions/extension-loader/create-extension-instance/file-system-provisioner-store/file-system-provisioner-store";
import clusterStoreInjectable from "../common/cluster-store/cluster-store.injectable";
import type { ClusterStore } from "../common/cluster-store/cluster-store";
import type { Cluster } from "../common/cluster/cluster";
import userStoreInjectable from "../common/user-store/user-store.injectable";
import type { UserStore } from "../common/user-store";

export const getDiForUnitTesting = (
  { doGeneralOverrides } = { doGeneralOverrides: false },
) => {
  const di = createContainer();

  setLegacyGlobalDiForExtensionApi(di, Environments.renderer);

  for (const filePath of getInjectableFilePaths()) {
    const injectableInstance = require(filePath).default;

    di.register({
      ...injectableInstance,
      aliases: [injectableInstance, ...(injectableInstance.aliases || [])],
    });
  }

  di.preventSideEffects();

  if (doGeneralOverrides) {
    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(extensionsStoreInjectable, () => ({ isEnabled: ({ id, isBundled }) => false }) as ExtensionsStore);

    di.override(fileSystemProvisionerStoreInjectable, () => ({}) as FileSystemProvisionerStore);

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(clusterStoreInjectable, () => ({ getById: (id): Cluster => ({}) as Cluster }) as ClusterStore);
    di.override(userStoreInjectable, () => ({}) as UserStore);

    di.override(getValueFromRegisteredChannelInjectable, () => () => undefined);
    di.override(registerIpcChannelListenerInjectable, () => () => undefined);

    overrideFsWithFakes(di);

    di.override(observableHistoryInjectable, () => {
      const historyFake = createMemoryHistory();

      return createObservableHistory(historyFake, {
        searchParams: searchParamsOptions,
      });
    });

    di.override(focusWindowInjectable, () => () => {});

    di.override(loggerInjectable, () => ({
      warn: noop,
      debug: noop,
      log: noop,
      error: (...args: any) => console.error(...args),
      info: noop,
    }));
  }

  return di;
};

const getInjectableFilePaths = memoize(() => [
  ...glob.sync("./**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../common/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);
