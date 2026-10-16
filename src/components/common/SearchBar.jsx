import { useId, useState } from "react";
import { searchCatalog } from "../../state/searchCatalog";
import "./SearchBar.css";

export default function SearchBar({ onSearch, onCourse, onTutor, onClear }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const id = useId();
  const results = searchCatalog(search);
  const expanded = open && Boolean(search.trim());
  function choose(result) {
    setOpen(false); setSelected(-1);
    if (result.tutor) onTutor(result.tutor);
    else onCourse(result.courseId);
  }
  function submit(event) {
    event.preventDefault();
    if (expanded && selected >= 0 && results[selected]) choose(results[selected]);
    else { setOpen(false); onSearch(search.trim()); }
  }
  return <form className="global-search" role="search" onSubmit={submit} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <div className="search-box">
      <button type="submit" className="search-submit" aria-label="Cari"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" /><path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
      <input type="search" role="combobox" value={search} maxLength={120} autoComplete="off" placeholder="Cari course, skill, atau tutor..."
        aria-label="Cari course atau skill" aria-expanded={expanded} aria-controls={`${id}-results`} aria-autocomplete="list"
        aria-activedescendant={expanded && selected >= 0 ? `${id}-${selected}` : undefined}
        onFocus={() => setOpen(true)} onChange={(event) => { setSearch(event.target.value); setSelected(-1); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setSelected(-1); }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true);
            if (results.length) setSelected((current) => event.key === 'ArrowDown' ? (current + 1) % results.length : current < 0 ? results.length - 1 : (current - 1 + results.length) % results.length);
          }
        }} />
      {search && <button type="button" className="clear-search" aria-label="Hapus pencarian" onClick={() => { setSearch(''); setSelected(-1); setOpen(false); onClear?.(); }}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="currentColor" opacity=".15" /><path d="m9 9 6 6m0-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>}
    </div>
    {expanded && <div className="global-search-dropdown">
      {results.length ? <><div id={`${id}-results`} role="listbox" aria-label="Hasil pencarian">{results.map((result, index) => <button key={result.id} id={`${id}-${index}`} type="button" role="option" aria-selected={selected === index}
        onMouseDown={(event) => event.preventDefault()} onClick={() => choose(result)}>
        <span className="global-search-type">{result.type}</span><span><strong>{result.label}</strong><small>{result.detail}</small></span>
      </button>)}</div><button className="global-search-all" type="button" onClick={() => { setOpen(false); onSearch(search.trim()); }}>Lihat semua course yang cocok</button></> : <p role="status">Tidak ada hasil untuk &ldquo;{search.trim()}&rdquo;. Coba kata kunci lain.</p>}
    </div>}
  </form>;
}
