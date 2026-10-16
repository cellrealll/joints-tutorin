import { useState } from "react";
import AppIcon from "../common/AppIcon";
import UserProfile from "../common/UserProfile";
import { formatDate, useTutorData } from "../../state/tutorStore";
import "./HeaderNotifications.css";

export default function Header({ onProfileClick, onShopClick, onHistoryClick }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const { transactions } = useTutorData();
  const purchases = transactions.filter((transaction) => transaction.title?.startsWith("Pembelian kredit"));

  return (
    <header className="topbar">
      <div className="header-actions">
        {onShopClick && <button
          className="icon-button"
          aria-label="Shop Kredit"
          title="Shop Kredit"
          onClick={onShopClick}
        >
          <AppIcon name="solar:shop-2-bold" size={23} />
        </button>}

        <div className="notification-wrap">
          <button
            className="icon-button"
            aria-label="Notifikasi"
            aria-expanded={notificationsOpen}
            onClick={() => { setNotificationsOpen(!notificationsOpen); setSeen(purchases.length); }}
          >
            <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM9 21h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {purchases.length > seen && <span className="notification-unread" aria-label="Ada notifikasi pembayaran baru" />}
          </button>

          {notificationsOpen && (
            <div className="notification-popover">
              <strong>Notifikasi</strong>
              {purchases.length ? <><div className="payment-notification-list">{purchases.slice(0, 5).map((purchase) => <article key={purchase.id}>
                <span>Pembayaran berhasil</span><p>+{purchase.amount} kredit ditambahkan ke saldo.</p><small>{formatDate(purchase.date)}</small>
              </article>)}</div><button type="button" className="text-link" onClick={() => { setNotificationsOpen(false); onHistoryClick?.(); }}>Lihat riwayat kredit</button></> : <p>Belum ada notifikasi baru.</p>}
            </div>
          )}
        </div>

        <UserProfile onClick={onProfileClick} />
      </div>
    </header>
  );
}
