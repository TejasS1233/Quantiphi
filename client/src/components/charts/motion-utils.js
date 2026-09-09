import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";

export function transitionWithDelay(transition, delaySeconds, fallback = DEFAULT_CHART_ENTER_TRANSITION) {
  const base = transition ?? fallback;
  return { ...base, delay: delaySeconds };
}

export function springOptionsFromTransition(transition, fallback = { stiffness: 60, damping: 20 }) {
  if (!transition) {
    return fallback;
  }
  if (transition.type === "spring") {
    const bounce =
      typeof transition.bounce === "number" ? transition.bounce : undefined;
    const baseStiffness =
      typeof transition.stiffness === "number"
        ? transition.stiffness
        : fallback.stiffness;
    const baseDamping =
      typeof transition.damping === "number"
        ? transition.damping
        : fallback.damping;
    return {
      stiffness:
        bounce == null
          ? baseStiffness
          : Math.min(400, Math.max(80, baseStiffness * (1 + bounce * 0.35))),
      damping:
        bounce == null
          ? baseDamping
          : Math.max(8, baseDamping * (1 - bounce * 0.25)),
      mass:
        typeof transition.mass === "number" ? transition.mass : fallback.mass,
    };
  }
  const duration =
    "duration" in transition && typeof transition.duration === "number"
      ? transition.duration
      : 0.8;
  return {
    stiffness: Math.min(500, Math.max(40, 280 / duration)),
    damping: Math.min(40, Math.max(12, 18 + duration * 4)),
  };
}
