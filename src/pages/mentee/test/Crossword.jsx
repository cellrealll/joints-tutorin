import { useRef, useState } from "react";

export default function Crossword({ puzzle, cells, onChange }) {
  const [selected, setSelected] = useState(0);
  const refs = useRef({});
  const intendedWord = useRef(null);
  const word = puzzle.words[selected];
  const active = new Set(word.cells);
  const board = new Map();
  const numbers = new Map();
  puzzle.words.forEach((entry, index) => {
    numbers.set(entry.cells[0], entry.position);
    entry.cells.forEach((key) => board.set(key, [...(board.get(key) || []), index]));
  });
  function focusWord(index) {
    intendedWord.current = index;
    setSelected(index);
    const entry = puzzle.words[index];
    refs.current[entry.cells.find((key) => !cells[key]) || entry.cells[0]]?.focus();
    intendedWord.current = null;
  }
  function typeAt(key, value) {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    onChange({ ...cells, [key]: letter });
    if (letter) refs.current[word.cells[word.cells.indexOf(key) + 1]]?.focus();
  }
  function keyDown(event, key, row, col) {
    const moves = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    if (moves[event.key]) {
      event.preventDefault();
      const [dy, dx] = moves[event.key];
      const next = `${row + dy}:${col + dx}`;
      const direction = dy ? "down" : "across";
      const match = board.get(next)?.find((index) => puzzle.words[index].orientation === direction);
      if (match !== undefined) { intendedWord.current = match; setSelected(match); }
      refs.current[next]?.focus();
      intendedWord.current = null;
    } else if (event.key === "Backspace") {
      event.preventDefault();
      if (cells[key]) onChange({ ...cells, [key]: "" });
      else {
        const previous = word.cells[word.cells.indexOf(key) - 1];
        if (previous) { onChange({ ...cells, [previous]: "" }); refs.current[previous]?.focus(); }
      }
    } else if (event.key === "Enter" && board.get(key).length > 1) {
      event.preventDefault();
      setSelected(board.get(key).find((index) => index !== selected));
    }
  }
  return <div className="test-crossword-layout">
    <section className="test-crossword-tool" aria-label="Teka-teki silang">
      <div className="test-crossword-heading"><h2>Teka-teki silang</h2><span>{puzzle.words.length} kata</span></div>
      <div className="test-grid-scroll"><div className="test-crossword-grid" style={{ "--columns": puzzle.cols }}>
        {Array.from({ length: puzzle.rows * puzzle.cols }, (_, index) => {
          const row = Math.floor(index / puzzle.cols), col = index % puzzle.cols, key = `${row}:${col}`;
          return board.has(key) ? <div className="test-crossword-cell" key={key} data-active={active.has(key)}>
            {numbers.has(key) && <span>{numbers.get(key)}</span>}
            <input ref={(node) => { if (node) refs.current[key] = node; else delete refs.current[key]; }}
              data-cell={key} aria-label={`Baris ${row + 1}, kolom ${col + 1}`} value={cells[key] || ""} autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck={false} maxLength={1}
              onFocus={(event) => {
                if (intendedWord.current !== null) setSelected(intendedWord.current);
                else if (!active.has(key)) setSelected(board.get(key)[0]);
                event.target.select();
              }}
              onChange={(event) => typeAt(key, event.target.value)} onKeyDown={(event) => keyDown(event, key, row, col)}
              onPaste={(event) => {
                event.preventDefault();
                const text = event.clipboardData.getData("text").toUpperCase().replace(/[^A-Z]/g, "");
                const next = { ...cells }, start = word.cells.indexOf(key);
                [...text].slice(0, word.cells.length - start).forEach((letter, offset) => { next[word.cells[start + offset]] = letter; });
                onChange(next);
              }} />
          </div> : <div key={key} className="test-crossword-block" aria-hidden="true" />;
        })}
      </div></div>
      <div className="test-active-clue"><strong>{word.position} {word.orientation === "across" ? "Mendatar" : "Menurun"}</strong><span>{word.clue}</span></div>
    </section>
    <aside className="test-clues"><h2>Petunjuk</h2>{["across", "down"].map((direction) => <section key={direction}>
      <h3>{direction === "across" ? "Mendatar" : "Menurun"}</h3>
      {puzzle.words.map((entry, index) => entry.orientation === direction && <button key={index} className="test-clue" aria-pressed={selected === index} onClick={() => focusWord(index)}>
        <strong>{entry.position}</strong><span>{entry.clue}<small>{entry.answer.length} huruf{entry.cells.every((key) => cells[key]) ? " / Terisi" : ""}</small></span>
      </button>)}
    </section>)}<span className="sr-only">{puzzle.words.filter((entry) => entry.cells.every((key) => cells[key])).length} kata terisi</span></aside>
  </div>;
}
