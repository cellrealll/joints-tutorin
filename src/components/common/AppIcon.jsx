import { Icon } from "@iconify/react";
import { careerIcons } from "./careerIcons";

export default function AppIcon({ name, size = 22, ...props }) {
  return <Icon icon={careerIcons[name] || name} width={size} height={size} {...props} />;
}
