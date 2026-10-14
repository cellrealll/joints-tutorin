import { Icon } from "@iconify/react";

export default function AppIcon({ name, size = 22, ...props }) {
  return <Icon icon={name} width={size} height={size} {...props} />;
}
