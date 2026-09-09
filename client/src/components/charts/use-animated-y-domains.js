"use client";;
import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LINE_LOADING_PULSE_EASE } from "./line-loading-timing";
import {
  domainsEqual,
  isYDomainTweenPhase,
  resolveAnimatedYDestinationDomains,
  shouldTweenYDomain,
} from "./y-domain-utils";

function lerpDomain(from, to, progress) {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
  ];
}

function snapDomains(
  domains,
  setAnimatedByAxis,
  animatedRef
) {
  if (domainsEqual(animatedRef.current, domains)) {
    return;
  }
  setAnimatedByAxis(domains);
  animatedRef.current = domains;
}

function tweenDomains({
  destination,
  durationMs,
  enabled,
  reducedMotion,
  animatedRef,
  setAnimatedByAxis,
  onSettled
}) {
  if (domainsEqual(animatedRef.current, destination)) {
    onSettled?.();
    return;
  }

  if (!enabled || reducedMotion) {
    snapDomains(destination, setAnimatedByAxis, animatedRef);
    onSettled?.();
    return;
  }

  const axisIds = Object.keys(destination);
  const fromSnapshot = animatedRef.current;

  let needsTween = false;
  for (const axisId of axisIds) {
    const from =
      fromSnapshot[axisId] ?? destination[axisId] ?? ([0, 100]);
    const to = destination[axisId] ?? from;
    if (shouldTweenYDomain(from, to)) {
      needsTween = true;
      break;
    }
  }

  if (!needsTween) {
    snapDomains(destination, setAnimatedByAxis, animatedRef);
    onSettled?.();
    return;
  }

  const fromByAxis = {};
  for (const axisId of axisIds) {
    fromByAxis[axisId] = fromSnapshot[axisId] ??
      destination[axisId] ?? [0, 100];
  }

  const control = animate(0, 1, {
    duration: durationMs / 1000,
    ease: [...LINE_LOADING_PULSE_EASE],
    onUpdate: (progress) => {
      const next = {};
      for (const axisId of axisIds) {
        const from =
          fromByAxis[axisId] ?? destination[axisId] ?? ([0, 100]);
        const to = destination[axisId] ?? from;
        next[axisId] = shouldTweenYDomain(from, to)
          ? lerpDomain(from, to, progress)
          : to;
      }
      animatedRef.current = next;
      setAnimatedByAxis(next);
    },
    onComplete: () => {
      snapDomains(destination, setAnimatedByAxis, animatedRef);
      onSettled?.();
    },
  });

  return control;
}

export function useAnimatedYDomains(
  {
    enabled,
    durationMs,
    chartPhase,
    skeletonByAxis,
    targetByAxis,
    onSettled,
    tweenOnTargetChange = false
  }
) {
  const reducedMotion = useReducedMotion();
  const destinationByAxis = resolveAnimatedYDestinationDomains(
    chartPhase,
    skeletonByAxis,
    targetByAxis
  );
  const destinationRef = useRef(destinationByAxis);
  destinationRef.current = destinationByAxis;
  const skeletonRef = useRef(skeletonByAxis);
  skeletonRef.current = skeletonByAxis;
  const targetRef = useRef(targetByAxis);
  targetRef.current = targetByAxis;

  const [animatedByAxis, setAnimatedByAxis] = useState(destinationByAxis);
  const animatedRef = useRef(animatedByAxis);
  const prevPhaseRef = useRef(chartPhase);
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  useEffect(() => {
    animatedRef.current = animatedByAxis;
  }, [animatedByAxis]);

  useEffect(() => {
    if (prevPhaseRef.current === chartPhase) {
      return;
    }
    prevPhaseRef.current = chartPhase;

    const settle = () => {
      onSettledRef.current?.();
    };

    // Keep grid spacing frozen while the series exits the viewport.
    if (chartPhase === "exiting") {
      snapDomains(skeletonRef.current, setAnimatedByAxis, animatedRef);
      return;
    }
    if (chartPhase === "exitingReady") {
      snapDomains(targetRef.current, setAnimatedByAxis, animatedRef);
      return;
    }
    if (chartPhase === "loading") {
      snapDomains(skeletonRef.current, setAnimatedByAxis, animatedRef);
      return;
    }
    if (chartPhase === "revealing" || chartPhase === "ready") {
      snapDomains(targetRef.current, setAnimatedByAxis, animatedRef);
      return;
    }

    if (!isYDomainTweenPhase(chartPhase)) {
      return;
    }

    const control = tweenDomains({
      destination: destinationRef.current,
      durationMs,
      enabled,
      reducedMotion,
      animatedRef,
      setAnimatedByAxis,
      onSettled: settle,
    });

    return () => control?.stop();
  }, [chartPhase, durationMs, enabled, reducedMotion]);

  const targetSignature = JSON.stringify(targetByAxis);
  const prevTargetSignatureRef = useRef(targetSignature);

  useEffect(() => {
    const inLivePhase = chartPhase === "ready" || chartPhase === "revealing";

    if (!inLivePhase) {
      prevTargetSignatureRef.current = targetSignature;
      return;
    }

    if (prevTargetSignatureRef.current === targetSignature) {
      return;
    }
    prevTargetSignatureRef.current = targetSignature;

    if (tweenOnTargetChange && chartPhase === "ready") {
      const control = tweenDomains({
        destination: targetRef.current,
        durationMs,
        enabled,
        reducedMotion,
        animatedRef,
        setAnimatedByAxis,
        onSettled: () => onSettledRef.current?.(),
      });

      return () => control?.stop();
    }

    snapDomains(targetRef.current, setAnimatedByAxis, animatedRef);
  }, [
    chartPhase,
    durationMs,
    enabled,
    reducedMotion,
    targetSignature,
    tweenOnTargetChange,
  ]);

  return animatedByAxis;
}
