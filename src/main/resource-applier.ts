/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../common/cluster/cluster";
import type { KubernetesObject } from "@kubernetes/client-node";
import fse from "fs-extra";
import * as yaml from "js-yaml";
import path from "path";
import tempy from "tempy";
import logger from "./logger";
import { appEventBus } from "../common/app-event-bus/event-bus";
import { cloneJsonObject, promiseExecFile } from "../common/utils";
import type { Patch } from "rfc6902";

function sanitizeObject(resource: KubernetesObject | any) {
  const cleaned = cloneJsonObject(resource);

  delete cleaned.status;
  delete cleaned.metadata?.resourceVersion;
  delete cleaned.metadata?.annotations?.["kubectl.kubernetes.io/last-applied-configuration"];

  return cleaned;
}

export class ResourceApplier {
  constructor(protected cluster: Cluster) {}

  /**
   * Patch a kube resource's manifest, throwing any error that occurs.
   * @param name The name of the kube resource
   * @param kind The kind of the kube resource
   * @param patch The list of JSON operations
   * @param ns The optional namespace of the kube resource
   */
  async patch(name: string, kind: string, patch: Patch, ns?: string): Promise<string> {
    appEventBus.emit({ name: "resource", action: "patch" });

    const kubectl = await this.cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();
    const proxyKubeconfigPath = await this.cluster.getProxyKubeconfigPath();
    const args = [
      "--kubeconfig", proxyKubeconfigPath,
      "patch",
      kind,
      name,
    ];

    if (ns) {
      args.push("--namespace", ns);
    }

    args.push(
      "--type", "json",
      "--patch", JSON.stringify(patch),
      "-o", "json",
    );

    try {
      const { stdout } = await promiseExecFile(kubectlPath, args);

      return stdout;
    } catch (error) {
      throw error.stderr ?? error;
    }
  }

  async apply(resource: KubernetesObject | any): Promise<string> {
    appEventBus.emit({ name: "resource", action: "apply" });

    const content = yaml.dump(sanitizeObject(resource));
    const kubectl = await this.cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();
    const proxyKubeconfigPath = await this.cluster.getProxyKubeconfigPath();
    const fileName = tempy.file({ name: "resource.yaml" });

    const args = [
      "apply",
      "--kubeconfig", proxyKubeconfigPath,
      "-o", "json",
      "-f", fileName,
    ];

    logger.debug(`[RESOURCE-APPLIER]: shooting manifests with: ${kubectlPath}`, { args });

    const execEnv = { ...process.env };
    const httpsProxy = this.cluster.preferences?.httpsProxy;

    if (httpsProxy) {
      execEnv.HTTPS_PROXY = httpsProxy;
    }

    try {
      await fse.writeFile(fileName, content);
      const { stdout } = await promiseExecFile(kubectlPath, args, { env: execEnv });

      return JSON.parse(stdout);
    } catch (error) {
      throw error?.stderr ?? error;
    } finally {
      await fse.unlink(fileName);
    }
  }

  public async kubectlApplyAll(resources: string[], extraArgs = ["-o", "json"]): Promise<string> {
    return this.kubectlCmdAll("apply", resources, extraArgs);
  }

  public async kubectlDeleteAll(resources: string[], extraArgs?: string[]): Promise<string> {
    return this.kubectlCmdAll("delete", resources, extraArgs);
  }

  protected async kubectlCmdAll(subCmd: string, resources: string[], args: string[] = []): Promise<string> {
    const kubectl = await this.cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();
    const proxyKubeconfigPath = await this.cluster.getProxyKubeconfigPath();
    const tmpDir = tempy.directory();

    await Promise.all(
      resources.map((resource, index) => fse.writeFile(path.join(tmpDir, `${index}.yaml`), resource))
    );

    args.unshift(
      subCmd,
      "--kubeconfig", proxyKubeconfigPath,
    );
    args.push("-f", tmpDir);

    logger.info(`[RESOURCE-APPLIER] Executing ${kubectlPath}`, { args });

    try {
      const { stdout } = await promiseExecFile(kubectlPath, args);

      return stdout;
    } catch (error) {
      logger.error(`[RESOURCE-APPLIER] cmd errored: ${error}`);

      const splitError = String(error).split(`.yaml": `);

      return splitError[1] ?? error;
    }
  }
}
