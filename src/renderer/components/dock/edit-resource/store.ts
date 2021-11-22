/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { StorageHelper } from "../../../utils";
import { DockTabStorageState, DockTabStore } from "../dock-tab-store/dock-tab.store";
import type { TabId } from "../dock/store";
import type { KubeObject, RawKubeObject } from "../../../../common/k8s-api/kube-object";
import { apiManager } from "../../../../common/k8s-api/api-manager";
import type { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { createKubeApiURL, parseKubeApi } from "../../../../common/k8s-api/kube-api-parse";
import yaml from "js-yaml";
import { createPatch } from "rfc6902";
import { patchTypeHeaders } from "../../../../common/k8s-api/kube-api";
import { runInAction } from "mobx";
import type { KubeJsonApi } from "../../../../extensions/renderer-api/k8s-api";

/**
 * The label name that Lens uses to receive the desired api version
 */
export const EditResourceLabelName = "k8slens-edit-resource-version";

export interface EditingResource {
  resource: string; // resource path, e.g. /api/v1/namespaces/default
  draft?: string; // edited draft in yaml
  firstDraft?: string;
}

interface Dependencies {
  createStorage:<T> (storageKey: string, options: DockTabStorageState<T>) => StorageHelper<DockTabStorageState<T>>;
  readonly apiKube: KubeJsonApi;
}

function getEditSelfLinkFor(object: RawKubeObject): string {
  if (object.metadata.labels?.[EditResourceLabelName]) {
    const { apiVersionWithGroup, ...parsedApi } = parseKubeApi(object.metadata.selfLink);

    parsedApi.apiVersion = object.metadata.labels?.[EditResourceLabelName];

    return createKubeApiURL({
      ...parsedApi,
      apiVersion: `${parsedApi.apiGroup}/${parsedApi.apiVersion}`,
    });
  }

  return object.metadata.selfLink;
}


export class EditResourceTabStore extends DockTabStore<EditingResource> {
  constructor(protected readonly dependencies: Dependencies) {
    super(dependencies, {
      storageKey: "edit_resource_store",
    });
  }

  protected finalizeDataForSave({ draft, ...data }: EditingResource): EditingResource {
    return data; // skip saving draft to local-storage
  }

  isReady(tabId: TabId) {
    return super.isReady(tabId) && Boolean(this.getResource(tabId)); // ready to edit resource
  }

  getStore(tabId: TabId): KubeObjectStore<KubeObject> | undefined {
    return apiManager.getStore(this.getResourcePath(tabId));
  }

  getResource(tabId: TabId): KubeObject | undefined {
    return this.getStore(tabId)?.getByPath(this.getResourcePath(tabId));
  }

  getResourcePath(tabId: TabId): string | undefined {
    return this.getData(tabId)?.resource;
  }

  getTabIdByResource(object: KubeObject): TabId {
    return this.findTabIdFromData(({ resource }) => object.selfLink === resource);
  }

  clearInitialDraft(tabId: TabId): void {
    delete this.getData(tabId)?.firstDraft;
  }

  /**
   * Calculates the diff between the initial version and the current saved
   * version and then patches the kube resource. Updating the tab with the
   * new data
   * @param tabId The ID of the tab to commit the changes for
   * @returns A success message
   */
  async commitEdits(tabId: TabId): Promise<{ kind: string; name: string }> {
    const tabData = this.getData(tabId);

    if (!tabData?.draft || !tabData?.firstDraft) {
      return null;
    }

    const { draft, firstDraft, resource } = tabData;

    const currentVersion = yaml.load(draft) as RawKubeObject;

    // Make sure we save this label so that we can use it in the future
    currentVersion.metadata.labels ??= {};
    currentVersion.metadata.labels[EditResourceLabelName] = currentVersion.apiVersion.split("/").pop();

    const selflink = getEditSelfLinkFor(currentVersion);
    const initialVersion = yaml.load(firstDraft) as RawKubeObject;
    const patches = createPatch(initialVersion, currentVersion);

    const { kind, metadata: { name }} = await this.dependencies.apiKube.patch(resource, { data: patches }, {
      headers: {
        "content-type": patchTypeHeaders.json,
      },
    });

    runInAction(() => {
      tabData.draft = undefined;
      tabData.firstDraft = undefined;
      tabData.resource = selflink;
    });

    return { kind, name };
  }
}
