import { scaleLinear } from "@visx/scale";

/** Default axis id when `yAxisId` is omitted (Recharts-style `0` / primary left axis). */
export const DEFAULT_Y_AXIS_ID = "left";

export function normalizeYAxisId(id) {
  if (id == null || id === "") {
    return DEFAULT_Y_AXIS_ID;
  }
  return String(id);
}

export function groupLinesByYAxisId(lines) {
  const groups = new Map();
  for (const line of lines) {
    const axisId = normalizeYAxisId(line.yAxisId);
    const bucket = groups.get(axisId) ?? [];
    bucket.push(line);
    groups.set(axisId, bucket);
  }
  return groups;
}

export function getPrimaryYScale(yScales, fallback) {
  const primary = yScales[DEFAULT_Y_AXIS_ID];
  if (primary) {
    return primary;
  }
  const first = Object.values(yScales)[0];
  return first ?? fallback;
}

export function buildYScalesForLines(
  {
    lines,
    innerHeight,
    resolveDomain
  }
) {
  const groups = groupLinesByYAxisId(lines);
  const scales = {};

  for (const [axisId, axisLines] of groups) {
    const dataKeys = axisLines.map((line) => line.dataKey);
    const domain = resolveDomain(dataKeys);
    scales[axisId] = scaleLinear({
      range: [innerHeight, 0],
      domain,
      nice: true,
    });
  }

  if (!scales[DEFAULT_Y_AXIS_ID]) {
    scales[DEFAULT_Y_AXIS_ID] = scaleLinear({
      range: [innerHeight, 0],
      domain: [0, 100],
      nice: true,
    });
  }

  return scales;
}

/** Build y-scales from pre-computed (already nice'd) domain endpoints. */
export function buildYScalesFromDomains(
  {
    lines,
    innerHeight,
    domainsByAxis
  }
) {
  const groups = groupLinesByYAxisId(lines);
  const scales = {};

  for (const [axisId] of groups) {
    const domain =
      domainsByAxis[axisId] ??
      domainsByAxis[DEFAULT_Y_AXIS_ID] ??
      ([0, 100]);
    scales[axisId] = scaleLinear({
      range: [innerHeight, 0],
      domain,
    });
  }

  if (!scales[DEFAULT_Y_AXIS_ID]) {
    scales[DEFAULT_Y_AXIS_ID] = scaleLinear({
      range: [innerHeight, 0],
      domain: domainsByAxis[DEFAULT_Y_AXIS_ID] ?? [0, 100],
    });
  }

  return scales;
}

/** Single-axis charts (bar, scatter, candlestick, live line). */
export function wrapSingleYScale(yScale) {
  return { [DEFAULT_Y_AXIS_ID]: yScale };
}
