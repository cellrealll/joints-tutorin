import AppIcon from "./AppIcon";

export default function Button({ children, icon, className = "primary-button", ...props }) {
  return (
    <button className={className} {...props}>
      {icon && <AppIcon name={icon} size={18} />}
      {children}
    </button>
  );
}
