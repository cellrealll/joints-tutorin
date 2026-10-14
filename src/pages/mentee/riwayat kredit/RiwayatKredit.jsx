import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { BalanceBanner, EmptyState } from "../../../components/common/ActivityUI";
import { TeachBanner } from "../dashboard/Dashboard";
import { formatDate, useTutorData } from "../../../state/tutorStore";
import "./RiwayatKredit.css";

const pageSize = 4;

export default function RiwayatKredit({ setActive, dashboardMode = "mentee" }) {
  const { transactions } = useTutorData();
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const filtered = transactions.filter((item) => filter === "Semua" || (filter === "Pemasukan" ? item.amount > 0 : item.amount < 0));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportHistory() {
    const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [["Tanggal", "Aktivitas", "Keterangan", "Kredit"], ...filtered.map((item) => [item.date, item.title, item.detail, item.amount])]
      .map((row) => row.map(quote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url; link.download = "riwayat-kredit-tutorin.csv"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="activity-layout credit-history-page">
    <div className="activity-main">
      <div className="activity-heading"><h1>Riwayat Kredit</h1><p>Pantau seluruh aktivitas kredit Anda dalam satu tempat.</p></div>
      <BalanceBanner onShop={dashboardMode === "mentee" ? () => setActive("Shop") : undefined} />
      <div className="activity-tabs" aria-label="Filter transaksi">
        {["Semua", "Pengeluaran", "Pemasukan"].map((label) => <button key={label} aria-pressed={filter === label}
          onClick={() => { setFilter(label); setPage(1); }}>{label}</button>)}
      </div>
      <div className="history-list-heading"><span>{filtered.length} transaksi</span><button onClick={exportHistory} title="Unduh riwayat CSV"><AppIcon name="solar:download-linear" size={17} />Unduh</button></div>
      <div className="history-list" key={`${filter}-${currentPage}`}>
        {visible.map((item) => <article className="history-row" key={item.id}>
          <span className={`history-icon ${item.amount > 0 ? "income" : "expense"}`}><AppIcon name={item.amount > 0 ? "solar:arrow-left-down-linear" : "solar:arrow-right-up-linear"} size={22} /></span>
          <div className="history-description"><h2>{item.title}</h2><p>{item.detail} <span aria-hidden="true">/</span> {formatDate(item.date)}</p></div>
          <div className={`history-amount ${item.amount > 0 ? "income" : "expense"}`}><strong>{item.amount > 0 ? "+" : ""}{item.amount} kredit</strong><span>{item.amount > 0 ? "Pemasukan" : "Pengeluaran"}</span></div>
        </article>)}
        {!visible.length && <EmptyState title="Belum ada transaksi" description="Aktivitas kredit akan muncul di sini." />}
      </div>
      {pageCount > 1 && <nav className="history-pagination" aria-label="Halaman riwayat kredit">
        <button disabled={currentPage === 1} aria-label="Halaman sebelumnya" onClick={() => setPage(currentPage - 1)}><AppIcon name="solar:alt-arrow-left-linear" size={18} /></button>
        {Array.from({ length: pageCount }, (_, index) => <button key={index} aria-current={currentPage === index + 1 ? "page" : undefined} onClick={() => setPage(index + 1)}>{index + 1}</button>)}
        <button disabled={currentPage === pageCount} aria-label="Halaman berikutnya" onClick={() => setPage(currentPage + 1)}><AppIcon name="solar:alt-arrow-right-linear" size={18} /></button>
      </nav>}
      {dashboardMode === "mentee" && <div className="activity-banner-footer"><TeachBanner setActive={setActive} /></div>}
    </div>
  </div>;
}
