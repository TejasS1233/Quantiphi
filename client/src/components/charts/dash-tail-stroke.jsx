"use client";;
import { useId } from "react";

export function DashTailStroke({
  pathD,
  pathLength,
  dashStartLength,
  dashStartX,
  innerWidth,
  innerHeight,
  stroke,
  strokeWidth,
  dashArray
}) {
  const clipPathId = useId().replace(/:/g, "");

  if (!pathD || pathLength <= 0 || dashStartLength >= pathLength) {
    return null;
  }

  const pad = strokeWidth * 2;
  const tailWidth = Math.max(0, innerWidth - dashStartX + pad);

  return (
    <>
      <defs>
        <clipPath id={clipPathId}>
          <rect
            height={innerHeight + pad}
            width={tailWidth}
            x={dashStartX - strokeWidth}
            y={-strokeWidth}
          />
        </clipPath>
      </defs>
      {/* Solid head — same curved path, gradient/fade preserved */}
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeDasharray={`${dashStartLength} ${Math.max(1, pathLength - dashStartLength)}`}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
      {/* Dashed tail — clipped to x ≥ dashStartX so dashes follow the curve */}
      <path
        clipPath={`url(#${clipPathId})`}
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </>
  );
}
