import "./BookingCredits.css";

export default function BookingCredits({ balance, cost, unit = "sesi", duration, confirmed = false }) {
  const hasPrice = Number.isFinite(cost);
  const shortfall = hasPrice ? Math.max(0, cost - balance) : 0;
  const format = (value) => Number(value).toLocaleString("id-ID");
  return <section className="booking-credits" aria-label="Rincian biaya dan kredit" aria-live="polite">
    <div className="booking-credits-price"><span>{confirmed ? "Biaya booking" : `Biaya ${unit}`}</span><strong>{hasPrice ? format(cost) : "Pilih mentor"}{hasPrice && <small> kredit</small>}</strong><p>{hasPrice ? `Per ${unit}${duration ? ` · ${duration} menit` : ""}` : "Biaya mengikuti mentor yang kamu pilih"}</p></div>
    <div className="booking-credits-wallet"><span>Saldo kredit kamu</span><strong>{format(balance)} <small>kredit</small></strong>{!confirmed && hasPrice && <p className={shortfall ? "booking-credits-shortfall" : ""}>{shortfall ? <>Kurang <b>{format(shortfall)} kredit</b></> : <>Sisa setelah booking <b>{format(balance - cost)} kredit</b></>}</p>}{confirmed && <p>Saldo setelah booking berhasil</p>}</div>
  </section>;
}
