import AppIcon from "../common/AppIcon";

export default function NavbarItem({ item, active, onSelect }) {
  const page = item.page || item.label;
  return (
    <button
      className={`nav-item ${active === page ? "selected" : ""}`}
      title={item.label}
      aria-label={item.label}
      aria-current={active === page ? "page" : undefined}
      data-guide-target={`nav-${page.toLowerCase().replaceAll(" ", "-")}`}
      onClick={() => onSelect(page)}
    >
      <AppIcon name={item.icon} size={23} />
      <span>{item.label}</span>
    </button>
  );
}
