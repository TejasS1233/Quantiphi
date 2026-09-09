"use client";;
import { motion } from "motion/react";
import { memo } from "react";
import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";

function MarkerCircles({
  fill,
  stroke,
  strokeWidth,
  ringGap,
  outlineWidth,
  outlineColor,
  radius
}) {
  const resolvedStroke = stroke ?? fill ?? "currentColor";
  const resolvedOutlineColor = outlineColor ?? resolvedStroke;
  const ringOuter = strokeWidth > 0 ? radius + ringGap + strokeWidth : radius;
  const outlineRadius = outlineWidth > 0 ? ringOuter + outlineWidth / 2 : 0;

  return (
    <>
      {outlineWidth > 0 ? (
        <circle
          cx={0}
          cy={0}
          fill="none"
          r={outlineRadius}
          stroke={resolvedOutlineColor}
          strokeWidth={outlineWidth}
        />
      ) : null}
      <circle cx={0} cy={0} fill={fill} r={radius} />
      {strokeWidth > 0 ? (
        <circle
          cx={0}
          cy={0}
          fill="none"
          r={radius + ringGap + strokeWidth / 2}
          stroke={resolvedStroke}
          strokeWidth={strokeWidth}
        />
      ) : null}
    </>
  );
}

export const StaticSeriesPointMarker = memo(function StaticSeriesPointMarker({
  cx,
  cy,
  scale = 1,
  fill,
  stroke,
  strokeWidth = 2,
  ringGap = 2,
  outlineWidth = 0,
  outlineColor,
  radius = 5
}) {
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      <MarkerCircles
        fill={fill}
        outlineColor={outlineColor}
        outlineWidth={outlineWidth}
        radius={radius}
        ringGap={ringGap}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
});

/** Motion enter marker — used only while the chart reveal is running. */
export function SeriesPointMarker({
  dataKey,
  index,
  cx,
  cy,
  enterBlur = 2,
  revealDelay,
  revealEpoch,
  enterDuration,
  fill,
  stroke,
  strokeWidth = 2,
  ringGap = 2,
  outlineWidth = 0,
  outlineColor,
  radius = 5
}) {
  const variants = {
    hidden: {
      opacity: 0,
      filter: `blur(${enterBlur}px)`,
      scale: 1,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        delay: revealDelay,
        duration: enterDuration,
        ease: DEFAULT_CHART_ENTER_TRANSITION.ease,
      },
    },
  };

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <motion.g
        animate="visible"
        initial="hidden"
        key={`${dataKey}-${index}-${revealEpoch}`}
        variants={variants}
      >
        <MarkerCircles
          fill={fill}
          outlineColor={outlineColor}
          outlineWidth={outlineWidth}
          radius={radius}
          ringGap={ringGap}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </motion.g>
    </g>
  );
}

export function getSeriesMarkerVisualExtent(style) {
  const radius = style.radius ?? 5;
  const strokeWidth = style.strokeWidth ?? 2;
  const ringGap = style.ringGap ?? 2;
  const outlineWidth = style.outlineWidth ?? 0;
  const showActiveHighlight = style.showActiveHighlight ?? true;
  const ring = strokeWidth > 0 ? ringGap + strokeWidth : 0;
  const outline = outlineWidth > 0 ? outlineWidth : 0;
  const highlightPad = showActiveHighlight ? radius * 0.35 : 0;
  return radius + ring + outline + highlightPad + 2;
}
