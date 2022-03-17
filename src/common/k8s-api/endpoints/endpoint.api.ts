/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { get } from "lodash";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface EndpointPort {
  name?: string;
  protocol: string;
  port: number;
}

export interface EndpointAddressDeclaration {
  hostname: string;
  ip: string;
  nodeName: string;
}

export interface EndpointSubset {
  addresses: EndpointAddressDeclaration[];
  notReadyAddresses: EndpointAddressDeclaration[];
  ports: EndpointPort[];
}

export interface TargetRef {
  kind: string;
  namespace: string;
  name: string;
  uid: string;
  resourceVersion: string;
  apiVersion: string;
}

export interface EndpointAddressData extends EndpointAddressDeclaration {
  targetRef?: Omit<TargetRef, "apiVersion">;
}

export class EndpointAddress implements EndpointAddressDeclaration {
  hostname: string;
  ip: string;
  nodeName: string;
  targetRef?: Omit<TargetRef, "apiVersion">;

  static create(data: EndpointAddressData): EndpointAddress {
    return new EndpointAddress(data);
  }

  constructor(data: EndpointAddressData) {
    this.hostname = data.hostname;
    this.ip = data.ip;
    this.nodeName = data.nodeName;
    this.targetRef = data.targetRef;
  }

  getId() {
    return this.ip;
  }

  getName() {
    return this.hostname;
  }

  getTargetRef(): TargetRef | undefined {
    if (this.targetRef) {
      return Object.assign(this.targetRef, { apiVersion: "v1" });
    }

    return undefined;
  }
}

export class EndpointSubset implements EndpointSubset {
  addresses: EndpointAddressDeclaration[];
  notReadyAddresses: EndpointAddressDeclaration[];
  ports: EndpointPort[];

  constructor(data: EndpointSubset) {
    this.addresses = get(data, "addresses", []);
    this.notReadyAddresses = get(data, "notReadyAddresses", []);
    this.ports = get(data, "ports", []);
  }

  getAddresses(): EndpointAddress[] {
    return this.addresses.map(EndpointAddress.create);
  }

  getNotReadyAddresses(): EndpointAddress[] {
    return this.notReadyAddresses.map(EndpointAddress.create);
  }

  toString(): string {
    return this.addresses
      .map(address => (
        this.ports
          .map(port => `${address.ip}:${port.port}`)
          .join(", ")
      ))
      .join(", ");
  }
}

export class Endpoint extends KubeObject {
  static kind = "Endpoints";
  static namespaced = true;
  static apiBase = "/api/v1/endpoints";

  declare subsets?: EndpointSubset[];

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getEndpointSubsets(): EndpointSubset[] {
    return this.subsets?.map(s => new EndpointSubset(s)) ?? [];
  }

  toString(): string {
    return this.getEndpointSubsets().map(String).join(", ") || "<none>";
  }
}

let endpointApi: KubeApi<Endpoint>;

if (isClusterPageContext()) {
  endpointApi = new KubeApi<Endpoint>({
    objectConstructor: Endpoint,
  });
}

export {
  endpointApi,
};
