/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./delete-cluster-dialog.module.scss";

import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { Button } from "../button";
import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../../../common/cluster/cluster";
import { saveKubeconfig } from "./save-config";
import { Notifications } from "../notifications";
import { HotbarStore } from "../../../common/hotbar-store";
import { boundMethod } from "autobind-decorator";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Select } from "../select";
import { Checkbox } from "../checkbox";
import { requestClearClusterAsDeleting, requestDeleteCluster, requestSetClusterAsDeleting } from "../../ipc";

export interface DeleteClusterDialogState {
  config: KubeConfig;
  cluster: Cluster;
}

const dialogState = observable.box<DeleteClusterDialogState | undefined>();

export interface DeleteClusterDialogProps {}

@observer
export class DeleteClusterDialog extends React.Component<DeleteClusterDialogProps> {
  @observable showContextSwitch = false;
  @observable newCurrentContext = "";

  constructor(props: DeleteClusterDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open(state: DeleteClusterDialogState) {
    dialogState.set(state);
  }

  static close() {
    dialogState.set(undefined);
  }

  onOpen(state: DeleteClusterDialogState) {
    this.newCurrentContext = "";

    if (this.isCurrentContext(state)) {
      this.showContextSwitch = true;
    }
  }

  @boundMethod
  onClose() {
    DeleteClusterDialog.close();
    this.showContextSwitch = false;
  }

  removeContext(state: DeleteClusterDialogState) {
    state.config.contexts = state.config.contexts.filter(item =>
      item.name !== state.cluster.contextName,
    );
  }

  changeCurrentContext(state: DeleteClusterDialogState) {
    if (this.newCurrentContext && this.showContextSwitch) {
      state.config.currentContext = this.newCurrentContext;
    }
  }

  @boundMethod
  async onDelete(state: DeleteClusterDialogState) {
    const { cluster, config } = state;

    await requestSetClusterAsDeleting(cluster.id);
    this.removeContext(state);
    this.changeCurrentContext(state);

    try {
      await saveKubeconfig(config, cluster.kubeConfigPath);
      HotbarStore.getInstance().removeAllHotbarItems(cluster.id);
      await requestDeleteCluster(cluster.id);
    } catch(error) {
      Notifications.error(`Cannot remove cluster, failed to process config file. ${error}`);
    } finally {
      await requestClearClusterAsDeleting(cluster.id);
    }

    this.onClose();
  }

  shouldDeleteBeDisabled({ cluster, config }: DeleteClusterDialogState) {
    const noContextsAvailable = config.contexts.filter(context => context.name !== cluster.contextName).length == 0;
    const newContextNotSelected = this.newCurrentContext === "";

    if (noContextsAvailable) {
      return false;
    }

    return this.showContextSwitch && newContextNotSelected;
  }

  isCurrentContext({ cluster, config }: DeleteClusterDialogState) {
    return config.currentContext == cluster.contextName;
  }

  renderCurrentContextSwitch({ cluster, config }: DeleteClusterDialogState) {
    if (!this.showContextSwitch) {
      return null;
    }

    return (
      <div className="mt-4">
        <Select
          options={(
            config
              .contexts
              .filter(context => context.name !== cluster.contextName)
              .map(ctx => ctx.name)
          )}
          value={this.newCurrentContext}
          onChange={contextName => {
            if (contextName) {
              this.newCurrentContext = contextName;
            }
          }}
          themeName="light"
          className="ml-[1px] mr-[1px]"
        />
      </div>
    );
  }

  renderDeleteMessage({ cluster }: DeleteClusterDialogState) {
    if (cluster.isInLocalKubeconfig()) {
      return (
        <div>
          Delete the <b>{cluster.getMeta().name}</b> context from Lens&apos;s internal kubeconfig?
        </div>
      );
    }

    return (
      <div>
        Delete the <b>{cluster.getMeta().name}</b> context from <b>{cluster.kubeConfigPath}</b>?
      </div>
    );
  }

  getWarningMessage({ cluster, config }: DeleteClusterDialogState) {
    const contexts = config.contexts.filter(context => context.name !== cluster.contextName);

    if (!contexts.length) {
      return (
        <p data-testid="no-more-contexts-warning">
          This will remove the last context in kubeconfig. There will be no active context.
        </p>
      );
    }

    if (this.isCurrentContext({ cluster, config })) {
      return (
        <p data-testid="current-context-warning">
          This will remove active context in kubeconfig. Use drop down below to&nbsp;select a&nbsp;different one.
        </p>
      );
    }

    if (cluster.isInLocalKubeconfig()) {
      return (
        <p data-testid="internal-kubeconfig-warning">
          Are you sure you want to delete it? It can be re-added through the copy/paste mechanism.
        </p>
      );
    }

    return (
      <p data-testid="kubeconfig-change-warning">The contents of kubeconfig file will be changed!</p>
    );
  }

  renderWarning(state: DeleteClusterDialogState) {
    return (
      <div className={styles.warning}>
        <Icon material="warning_amber" className={styles.warningIcon}/>
        {this.getWarningMessage(state)}
      </div>
    );
  }

  renderContents(state: DeleteClusterDialogState) {
    const contexts = state.config.contexts.filter(context => context.name !== state.cluster.contextName);
    const disableDelete = this.shouldDeleteBeDisabled(state);

    return (
      <>
        <div className={styles.dialogContent}>
          {this.renderDeleteMessage(state)}
          {this.renderWarning(state)}
          <hr className={styles.hr}/>
          {contexts.length > 0 && (
            <>
              <div className="mt-4">
                <Checkbox
                  data-testid="context-switch"
                  label={(
                    <>
                      <span className="font-semibold">Select current-context</span>{" "}
                      {!this.isCurrentContext(state) && "(optional)"}
                    </>
                  )}
                  value={this.showContextSwitch}
                  onChange={value => this.showContextSwitch = this.isCurrentContext(state) ? true : value}
                />
              </div>
              {this.renderCurrentContextSwitch(state)}
            </>
          )}
        </div>
        <div className={styles.dialogButtons}>
          <Button
            onClick={this.onClose}
            plain
            label="Cancel"
          />
          <Button
            onClick={() => this.onDelete(state)}
            autoFocus
            accent
            label="Delete Context"
            disabled={disableDelete}
          />
        </div>
      </>
    );
  }

  render() {
    const state = dialogState.get();

    return (
      <Dialog
        className={styles.dialog}
        isOpen={Boolean(state)}
        close={this.onClose}
        onOpen={state && (() => this.onOpen(state))}
      >
        {state && this.renderContents(state)}
      </Dialog>
    );
  }
}
