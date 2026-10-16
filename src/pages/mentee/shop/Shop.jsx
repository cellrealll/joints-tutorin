import { useEffect, useRef, useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { BalanceBanner } from "../../../components/common/ActivityUI";
import { completeDemoPurchase, getTutorBalance } from "../../../state/tutorStore";
import { useFeedback } from "../../../state/feedbackContext";
import "./Shop.css";
import Dropdown from "../../../components/common/Dropdown";

const packages = [
  { id: "starter", name: "Starter", credits: 20, bonus: 0, price: 25000, detail: "Cocok untuk coba 1-2 sesi" },
  { id: "routine", name: "Belajar Rutin", credits: 60, bonus: 0, price: 69000, detail: "Hemat 8%, favorit pelajar aktif", badge: "Favorit pelajar" },
  { id: "intensive", name: "Intensif", credits: 120, bonus: 10, price: 129000, detail: "Bonus 10 kredit untuk persiapan ujian" },
];
const methods = [
  { name: "QRIS", icon: "solar:qr-code-linear", detail: "E-wallet atau mobile banking" },
  { name: "Virtual Account", icon: "mdi:bank-outline", detail: "BCA, Mandiri, BNI, BRI" },
  { name: "E-Wallet", icon: "solar:wallet-linear", detail: "GoPay, OVO, DANA" },
];
const rupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function Shop({ setActive }) {
  const feedback = useFeedback();
  const [selected, setSelected] = useState(packages[1]);
  const [method, setMethod] = useState("QRIS");
  const [filter, setFilter] = useState("all");
  const [order, setOrder] = useState(null);
  const [remaining, setRemaining] = useState(900);
  const [proof, setProof] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const verificationRef = useRef(null);
  const timerRef = useRef(null);
  const pending = order?.status === "pending";
  const expired = pending && remaining === 0;
  const currentStep = order?.status === "success" ? 2 : pending ? 1 : 0;
  const visible = packages.filter((item) => filter === "all" || (filter === "small" ? item.credits <= 60 : item.credits > 60));

  useEffect(() => {
    if (!pending) return;
    const update = () => setRemaining(Math.max(0, Math.ceil((order.expiresAt - Date.now()) / 1000)));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [pending, order]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  function startCheckout() {
    setOrder({ ...selected, packageId: selected.id, method, id: crypto.randomUUID(), status: "pending", expiresAt: Date.now() + 900000 });
    setRemaining(900); setProof(""); setMessage("");
    verificationRef.current.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
  }
  function finishDemo() {
    if (!pending || busy || expired || Date.now() >= order.expiresAt) return;
    setBusy(true); setMessage("");
    timerRef.current = setTimeout(async () => {
      try {
        if (Date.now() >= order.expiresAt) { setRemaining(0); return; }
        const purchase = await completeDemoPurchase(order);
        setOrder({ ...order, status: "success" });
        setMessage(`${order.credits + order.bonus} kredit berhasil ditambahkan ke saldo demo.`);
        feedback.show({ title: "Pembayaran berhasil", message: `${purchase.amount} kredit sudah masuk. Saldo kamu sekarang ${getTutorBalance()} kredit.`,
          actionLabel: "Lihat riwayat kredit", onAction: () => setActive("Riwayat Kredit") });
      } catch (error) { setMessage(error.message || "Kredit belum tersimpan. Coba lagi."); }
      finally { setBusy(false); }
    }, 700);
  }
  function uploadProof(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "application/pdf"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("Pilih file PNG, JPG, atau PDF berukuran maksimal 5 MB."); event.target.value = ""; return;
    }
    setProof(file.name); setMessage("Bukti dipilih untuk simulasi; file tidak dikirim ke server.");
  }

  return <div className="shop-page">
    <div className="activity-heading"><div className="shop-title"><h1>Shop Kredit</h1><span>Mode demo</span></div><p>Pilih paket kredit dan metode pembayaran sesuai kebutuhan belajarmu.</p></div>
    <div className="shop-top"><BalanceBanner /><ol className="shop-steps" aria-label="Tahap pembelian">
      {[{ title: "Pilih paket", detail: "Tentukan jumlah kredit" }, { title: "Bayar", detail: "Pilih metode pembayaran" }, { title: "Verifikasi", detail: "Konfirmasi pembayaran" }].map((step, index) => <li key={step.title} className={index <= currentStep ? "active" : ""} aria-current={currentStep === index ? "step" : undefined}>
        <span>{order?.status === "success" || index === 0 && order ? <AppIcon name="solar:check-read-linear" size={20} /> : index + 1}</span><div><strong>{step.title}</strong><small>{step.detail}</small></div>
      </li>)}
    </ol></div>
    <div className="shop-grid">
      <div className="shop-options">
        <div className="shop-section-heading"><h2>Pilih Paket Kredit</h2><Dropdown className="shop-package-dropdown" ariaLabel="Filter paket" value={filter} disabled={pending} onChange={setFilter}
          options={[{ value: "all", label: "Semua paket" }, { value: "small", label: "20-60 kredit" }, { value: "large", label: "120+ kredit" }]} /></div>
        <fieldset className="shop-package-list" disabled={pending}><legend className="sr-only">Paket kredit</legend>
          {visible.map((item) => <label className={`shop-package ${selected.id === item.id ? "selected" : ""}`} key={item.id}>
            <input type="radio" name="credit-package" value={item.id} checked={selected.id === item.id} onChange={() => { setSelected(item); if (order?.status === "success") setOrder(null); }} />
            <span className="shop-package-coin"><AppIcon name="bx:coin-stack" size={27} /></span><span className="shop-package-description"><strong>{item.name}{item.badge && <small>{item.badge}</small>}</strong><span>{item.detail}</span></span>
            <span className="shop-package-credits">{item.credits} kredit{item.bonus > 0 && <small>+{item.bonus} bonus</small>}</span><strong className="shop-package-price">{rupiah(item.price)}</strong>
          </label>)}
        </fieldset>
        <section className="shop-payment"><h2>Bayar menggunakan apa?</h2><fieldset disabled={pending} className="shop-methods"><legend className="sr-only">Metode pembayaran</legend>
          {methods.map((item) => <label className={`shop-method ${method === item.name ? "selected" : ""}`} key={item.name}>
            <input type="radio" name="payment-method" value={item.name} checked={method === item.name} onChange={() => { setMethod(item.name); if (order?.status === "success") setOrder(null); }} />
            <AppIcon name={item.icon} size={26} /><strong>{item.name}</strong><span>{item.detail}</span>
          </label>)}
        </fieldset></section>
      </div>
      <aside className="shop-summary">
        <section className="activity-panel"><h2>Ringkasan Pembelian</h2><dl className="activity-pairs"><div><dt>Paket</dt><dd>{selected.name}</dd></div><div><dt>Jumlah kredit</dt><dd>{selected.credits} kredit</dd></div><div><dt>Bonus</dt><dd>+{selected.bonus} kredit</dd></div><div><dt>Metode</dt><dd>{method}</dd></div></dl>
          <div className="shop-total"><strong>Total bayar</strong><strong>{rupiah(selected.price)}</strong></div>
          <button className="activity-primary shop-checkout" disabled={pending || order?.status === "success"} onClick={startCheckout}><AppIcon name="solar:card-linear" size={20} />{pending ? "Menunggu verifikasi" : order?.status === "success" ? "Pembelian selesai" : "Lanjut bayar"}</button>
          <p className="shop-demo-note">Simulasi pembayaran. Tidak ada uang yang ditagih.</p>
        </section>
        <section className="activity-panel shop-verification" ref={verificationRef} aria-labelledby="shop-verification-title"><h2 id="shop-verification-title">Verifikasi Pembayaran</h2>
          {!order ? <div className="shop-verification-empty"><AppIcon name="solar:shield-check-linear" size={34} /><p>Pilih paket dan lanjutkan pembayaran.</p></div>
            : order.status === "success" ? <div className="shop-success"><AppIcon name="solar:check-circle-bold" size={50} /><h3>Pembayaran demo berhasil</h3><p>{order.credits + order.bonus} kredit masuk ke saldo Anda.</p><button className="activity-primary" onClick={() => setActive("Riwayat Kredit")}>Lihat riwayat kredit</button><button className="shop-text-button" onClick={() => { setOrder(null); setMessage(""); }}>Beli paket lagi</button></div>
              : <>
                <div className="shop-verification-status"><span><AppIcon name={methods.find((item) => item.name === order.method).icon} size={34} /></span><div><strong>{expired ? "Waktu pembayaran habis" : `Selesaikan dalam ${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`}</strong><p>{order.method} / {rupiah(order.price)}</p></div></div>
                <div className="shop-demo-invoice"><strong>Invoice demo</strong><span>{order.id.slice(0, 8).toUpperCase()}</span><p>{order.method === "QRIS" ? "Kode pembayaran asli belum tersedia." : "Akun pembayaran asli belum tersedia."}</p></div>
                <label className={`shop-upload ${expired || busy ? "disabled" : ""}`}><AppIcon name="solar:cloud-upload-linear" size={26} /><span><strong>{proof || "Pilih bukti pembayaran"}</strong><small>PNG/JPG/PDF maks. 5 MB (opsional)</small></span><input type="file" accept="image/png,image/jpeg,application/pdf" disabled={expired || busy} onChange={uploadProof} /></label>
                <p className="shop-pending"><AppIcon name="solar:clock-circle-linear" size={20} />{expired ? "Invoice kedaluwarsa" : busy ? "Memverifikasi simulasi..." : "Menunggu pembayaran demo"}</p>
                <button className="activity-primary shop-checkout" disabled={expired || busy} onClick={finishDemo}>{busy && <span className="activity-spinner" />}{busy ? "Memproses..." : "Simulasikan pembayaran berhasil"}</button>
                <button className="shop-text-button" disabled={busy} onClick={() => { setOrder(null); setProof(""); setMessage(""); }}>{expired ? "Pilih paket kembali" : "Batalkan pembelian"}</button>
              </>}
          <p role="status" className="shop-message">{message}</p>
        </section>
      </aside>
    </div>
  </div>;
}
