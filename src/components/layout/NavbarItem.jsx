import AppIcon from "../common/AppIcon";

export default function NavbarItem({ item, active, onSelect }) {
  return (
    <button
      className={`nav-item ${active === item.label ? "selected" : ""}`}
      title={item.label}
      aria-label={item.label}
      aria-current={active === item.label ? "page" : undefined}
      onClick={() => onSelect(item.label)}
    >
      <AppIcon name={item.icon} size={23} />
      <span>{item.label}</span>
    </button>
  );
}
