/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pie-chart.scss";
import React from "react";
import { observer } from "mobx-react";
import ChartJS, { ChartOptions } from "chart.js";
import { Chart, ChartProps } from "./chart";
import { cssNames } from "../../utils";
import { ThemeStore } from "../../theme.store";

export interface PieChartProps extends ChartProps {
}

function getCutout(length: number | undefined): number {
  switch (length) {
    case 0:
    case 1:
      return 88;
    case 2:
      return 76;
    case 3:
      return 63;
    default:
      return 50;
  }
}

export const PieChart = observer((props: PieChartProps) => {
  const { data, className, options, ...chartProps } = props;
  const { contentColor } = ThemeStore.getInstance().activeTheme.colors;
  const opts: ChartOptions = {
    maintainAspectRatio: false,
    tooltips: {
      mode: "index",
      callbacks: {
        title: () => "",
        label: ({ datasetIndex, index }, { datasets = [] }) => {
          if (datasetIndex === undefined || index === undefined) {
            return "<unknown>";
          }

          const { data = [], label, _meta } = (datasets[datasetIndex] as ChartJS.ChartDataSets & { _meta: Record<string, { total: number }> });
          const value = data[index] as number | undefined;
          const { total } = Object.values(_meta)[0];

          if (!value) {
            return `${label}: N/A`;
          }

          const percent = Math.round((value / total) * 100);

          return isNaN(percent)
            ? `${label}: N/A`
            : `${label}: ${percent}%`;
        },
      },
      filter: ({ datasetIndex, index }, { datasets = [] }) => {
        if (datasetIndex === undefined) {
          return false;
        }

        const { data = [] } = datasets[datasetIndex];

        if (datasets.length === 1) return true;

        return index !== data.length - 1;
      },
      position: "cursor",
    },
    elements: {
      arc: {
        borderWidth: 1,
        borderColor: contentColor,
      },
    },
    cutoutPercentage: getCutout(data.datasets?.length),
    responsive: true,
    ...options,
  };

  return (
    <Chart
      className={cssNames("PieChart flex column align-center", className)}
      data={data}
      options={props.showChart ? {} : opts}
      {...chartProps}
    />
  );
});

ChartJS.Tooltip.positioners.cursor = function (elements: any, position: { x: number; y: number }) {
  return position;
};
