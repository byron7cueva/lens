/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./ingress-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { makeObservable, observable, reaction } from "mobx";
import { DrawerItem, DrawerTitle } from "../drawer";
import { ILoadBalancerIngress, Ingress } from "../../../common/k8s-api/endpoints";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { ResourceMetrics } from "../resource-metrics";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { IngressCharts } from "./ingress-charts";
import { KubeObjectMeta } from "../kube-object-meta";
import { getBackendServiceNamePort, getMetricsForIngress, type IngressMetricData } from "../../../common/k8s-api/endpoints/ingress.api";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { boundMethod } from "../../utils";
import logger from "../../../common/logger";

export interface IngressDetailsProps extends KubeObjectDetailsProps<Ingress> {
}

@observer
export class IngressDetails extends React.Component<IngressDetailsProps> {
  @observable metrics: IngressMetricData | null = null;

  constructor(props: IngressDetailsProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),
    ]);
  }

  @boundMethod
  async loadMetrics() {
    const { object: ingress } = this.props;

    this.metrics = await getMetricsForIngress(ingress.getName(), ingress.getNs());
  }

  renderPaths(ingress: Ingress) {
    const { spec: { rules }} = ingress;

    if (!rules || !rules.length) return null;

    return rules.map((rule, index) => {
      return (
        <div className="rules" key={index}>
          {rule.host && (
            <div className="host-title">
              <>Host: {rule.host}</>
            </div>
          )}
          {rule.http && (
            <Table className="paths">
              <TableHead>
                <TableCell className="path">Path</TableCell>
                <TableCell className="backends">Backends</TableCell>
              </TableHead>
              {
                rule.http.paths.map((path, index) => {
                  const { serviceName, servicePort } = getBackendServiceNamePort(path.backend);
                  const backend = `${serviceName}:${servicePort}`;

                  return (
                    <TableRow key={index}>
                      <TableCell className="path">{path.path || ""}</TableCell>
                      <TableCell className="backends">
                        <p key={backend}>{backend}</p>
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </Table>
          )}
        </div>
      );
    });
  }

  renderIngressPoints(ingressPoints: ILoadBalancerIngress[]) {
    if (!ingressPoints || ingressPoints.length === 0) return null;

    return (
      <div>
        <Table className="ingress-points">
          <TableHead>
            <TableCell className="name">Hostname</TableCell>
            <TableCell className="ingresspoints">IP</TableCell>
          </TableHead>
          {ingressPoints.map(({ hostname, ip }, index) => {
            return (
              <TableRow key={index}>
                <TableCell className="name">{hostname ? hostname : "-"}</TableCell>
                <TableCell className="ingresspoints">{ip ? ip : "-"}</TableCell>
              </TableRow>
            );
          })
          })
        </Table>
      </div>
    );
  }

  render() {
    const { object: ingress } = this.props;

    if (!ingress) {
      return null;
    }

    if (!(ingress instanceof Ingress)) {
      logger.error("[IngressDetails]: passed object that is not an instanceof Ingress", ingress);

      return null;
    }

    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Ingress);
    const port = ingress.getServiceNamePort();

    return (
      <div className="IngressDetails">
        {!isMetricHidden && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={[
              "Network",
              "Duration",
            ]}
            object={ingress}
            metrics={this.metrics}
          >
            <IngressCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={ingress}/>
        <DrawerItem name="Ports">
          {ingress.getPorts()}
        </DrawerItem>
        {ingress.spec.tls && (
          <DrawerItem name="TLS">
            {ingress.spec.tls.map((tls, index) => <p key={index}>{tls.secretName}</p>)}
          </DrawerItem>
        )}
        {port && (
          <DrawerItem name="Service">
            {port.serviceName}:{port.servicePort}
          </DrawerItem>
        )}
        <DrawerTitle title="Rules"/>
        {this.renderPaths(ingress)}

        <DrawerTitle title="Load-Balancer Ingress Points"/>
        {this.renderIngressPoints(ingress.status?.loadBalancer?.ingress ?? [])}
      </div>
    );
  }
}
