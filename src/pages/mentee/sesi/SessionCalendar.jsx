import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { dateKey, formatDate } from "../../../state/tutorStore";
import { categoryLabels, sessionCategory } from "./sessionUtils";

export default function SessionCalendar({ sessions, selectedDate, onSelectDate }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const today = dateKey(new Date());
  const offset = (month.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const calendarDays = Math.ceil((offset + count) / 7) * 7;
  const eventsByDate = new Map();
  sessions.forEach((session) => {
    const events = eventsByDate.get(session.date) || [];
    events.push(session);
    eventsByDate.set(session.date, events);
  });

  return <section className="activity-panel sessions-calendar">
    <h2>Kalender Sesi<AppIcon name="solar:calendar-linear" size={23} /></h2>
    <button className="sessions-today-button" onClick={() => {
      setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
      onSelectDate(today, true);
    }}><span />Hari ini: {formatDate(today, { month: "short" })}</button>
    <div className="sessions-month">
      <button aria-label="Bulan sebelumnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><AppIcon name="solar:alt-arrow-left-linear" size={18} /></button>
      <strong>{new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(month)}</strong>
      <button aria-label="Bulan berikutnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><AppIcon name="solar:alt-arrow-right-linear" size={18} /></button>
    </div>
    <div className="sessions-calendar-grid">
      {["S", "S", "R", "K", "J", "S", "M"].map((day, index) => <span className="sessions-day-name" key={index}>{day}</span>)}
      {Array.from({ length: calendarDays }, (_, index) => {
        const day = index - offset + 1;
        if (day < 1 || day > count) return <span key={index} />;
        const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
        const events = eventsByDate.get(key) || [];
        const categories = [...new Set(events.map(sessionCategory))];
        const label = [key === today ? "Hari ini" : "", formatDate(key), ...categories.map((category) => `${events.filter((event) => sessionCategory(event) === category).length} ${categoryLabels[category].toLowerCase()}`)].filter(Boolean).join(", ");
        return <button key={key} data-date={key} className={`${categories.length === 1 ? `has-${categories[0]}` : categories.length > 1 ? "has-mixed" : ""} ${selectedDate === key ? "selected" : ""}`}
          aria-pressed={selectedDate === key} aria-current={key === today ? "date" : undefined} aria-label={label} title={label} onClick={() => onSelectDate(key)}>
          <span>{day}</span><span className="sessions-date-markers" aria-hidden="true">{categories.map((category) => <i key={category} className={`session-marker ${category}`} />)}</span>
        </button>;
      })}
    </div>
    <div className="sessions-calendar-legend">
      {Object.entries(categoryLabels).map(([category, label]) => <span key={category}><i className={`session-marker ${category}`} />{label}</span>)}
      <span><i className="session-today-marker" />Hari ini</span>
    </div>
  </section>;
}
