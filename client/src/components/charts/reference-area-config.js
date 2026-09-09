import { Children, isValidElement } from "react";
import { normalizeYAxisId } from "./y-axis-scales";

function getChildComponentName(child) {
  const childType = child.type;
  return typeof child.type === "function"
    ? childType.displayName || childType.name || ""
    : "";
}

function isReferenceAreaElement(child) {
  return getChildComponentName(child) === "ReferenceArea";
}

/** Collect {@link ReferenceArea} props from chart children for axis label styling. */
export function extractReferenceAreaConfigs(children) {
  const configs = [];

  const visit = (node) => {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) {
        return;
      }

      if (isReferenceAreaElement(child)) {
        const props = child.props;
        if (props) {
          configs.push({
            yAxisId: normalizeYAxisId(props.yAxisId),
            y1: props.y1,
            y2: props.y2,
            axisLabelColor: props.axisLabelColor,
          });
        }
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
