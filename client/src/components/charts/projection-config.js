import { Children, Fragment, isValidElement } from "react";
import { isChartClipPassthrough } from "./chart-child-passthrough";
import {
  projectionDateExtents,
  projectionValueExtents,
} from "./projection-utils";
import { normalizeYAxisId } from "./y-axis-scales";

function getChildComponentName(child) {
  const childType = child.type;
  return typeof child.type === "function"
    ? childType.displayName || childType.name || ""
    : "";
}

function isProjectionLineElement(child) {
  return getChildComponentName(child) === "ProjectionLine";
}

function normalizeProjectionData(data) {
  if (!data?.length) {
    return [];
  }
  return data.map((point) => ({
    date: point.date instanceof Date ? point.date : new Date(point.date),
    value: point.value,
  }));
}

/** Collect {@link ProjectionLine} props from chart children for domain extension. */
export function extractProjectionLineConfigs(children) {
  const configs = [];

  const visit = (node) => {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) {
        return;
      }

      if (child.type === Fragment) {
        visit((child.props).children);
        return;
      }

      if (isProjectionLineElement(child)) {
        const props = child.props;
        const data = normalizeProjectionData(props?.data);
        if (data.length >= 2) {
          configs.push({
            yAxisId: normalizeYAxisId(props?.yAxisId),
            data,
          });
        }
        return;
      }

      if (isChartClipPassthrough(child.type)) {
        visit((child.props).children);
        return;
      }

      const childProps = child.props;
      if (childProps?.children) {
        visit(childProps.children);
      }
    });
  };

  visit(children);
  return configs;
}

export function mergeProjectionYDomain(domain, configs, yAxisId) {
  const paths = configs
    .filter((config) => config.yAxisId === yAxisId)
    .map((config) => config.data);
  const extents = projectionValueExtents(paths);
  if (!extents) {
    return domain;
  }

  const [min, max] = domain;
  const nextMin = Math.min(min, extents.minValue);
  const nextMax = Math.max(max, extents.maxValue);

  if (nextMin >= 0 && min >= 0) {
    return [0, nextMax <= 0 ? 100 : nextMax * 1.1];
  }

  const padding = (nextMax - nextMin) * 0.05 || 1;
  return [nextMin - padding, nextMax + padding];
}

export function mergeProjectionXDomainMax(maxTime, configs) {
  const paths = configs.map((config) => config.data);
  const extents = projectionDateExtents(paths);
  if (!extents) {
    return maxTime;
  }
  return Math.max(maxTime, extents.maxTime);
}
