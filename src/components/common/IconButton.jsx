import AppIcon from "./AppIcon";

export default function IconButton({ icon, size = 23, label, ...props }) {
  return (
    <button className="icon-button" aria-label={label} {...props}>
      <AppIcon name={icon} size={size} />
    </button>
  );
}
