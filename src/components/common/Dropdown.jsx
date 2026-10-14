import { useEffect, useId, useRef, useState } from "react";
import AppIcon from "./AppIcon";
import "./Dropdown.css";

export default function Dropdown({ id, name, value, options, onChange, disabled = false, ariaLabel, className = "" }) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const listId = `${controlId}-options`;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef({ text: "", time: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [side, setSide] = useState("bottom");
  const expanded = open && !disabled;
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!expanded) return;
    function closeOutside(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded]);

  useEffect(() => {
    if (expanded) rootRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, expanded]);

  function showMenu() {
    const rect = triggerRef.current.getBoundingClientRect();
    const dialogRect = triggerRef.current.closest("dialog")?.getBoundingClientRect();
    const bottomSpace = Math.min(window.innerHeight, dialogRect?.bottom ?? window.innerHeight) - rect.bottom;
    const topSpace = rect.top - Math.max(0, dialogRect?.top ?? 0);
    setSide(bottomSpace < Math.min(options.length * 42 + 16, 230) && topSpace > bottomSpace ? "top" : "bottom");
    setActive(Math.max(0, options.findIndex((option) => option.value === value)));
    searchRef.current = { text: "", time: 0 };
    setOpen(true);
  }

  function choose(index) {
    if (!options[index]) return;
    onChange(options[index].value);
    setOpen(false);
    triggerRef.current.focus();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && expanded) {
      event.preventDefault(); event.stopPropagation(); setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!expanded) showMenu();
      else setActive((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (expanded && (event.key === "Home" || event.key === "End")) {
      event.preventDefault(); setActive(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (expanded) choose(active); else showMenu();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      const query = now - searchRef.current.time < 600 ? searchRef.current.text + event.key : event.key;
      const index = options.findIndex((option) => option.label.toLowerCase().startsWith(query.toLowerCase()));
      if (index >= 0) { if (!expanded) showMenu(); setActive(index); }
      searchRef.current = { text: query.toLowerCase(), time: now };
    }
  }

  return <div className={`custom-dropdown ${className}`} ref={rootRef} data-open={expanded} data-side={side}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
    <button ref={triggerRef} id={controlId} type="button" className="dropdown-trigger" role="combobox" aria-label={ariaLabel}
      aria-expanded={expanded} aria-haspopup="listbox" aria-controls={listId} aria-activedescendant={expanded ? `${listId}-${active}` : undefined}
      disabled={disabled || !options.length} onKeyDown={handleKeyDown} onClick={() => { if (expanded) setOpen(false); else showMenu(); }}>
      <span>{selected?.label || "Pilih opsi"}</span><span className="dropdown-chevron" aria-hidden="true"><AppIcon name="solar:alt-arrow-down-linear" size={18} /></span>
    </button>
    {expanded && <div className="dropdown-menu" id={listId} role="listbox" aria-label={ariaLabel || "Pilihan"}>
      {options.map((option, index) => <div key={option.value} className="dropdown-option" role="option" id={`${listId}-${index}`}
        aria-selected={option.value === value} data-active={active === index} onPointerMove={() => setActive(index)}
        onPointerDown={(event) => event.preventDefault()} onClick={() => choose(index)}>
        <span>{option.label}</span><span className="dropdown-check">{option.value === value && <AppIcon name="solar:check-read-linear" size={17} />}</span>
      </div>)}
    </div>}
  </div>;
}
