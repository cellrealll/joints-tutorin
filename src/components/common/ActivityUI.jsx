import AppIcon from "./AppIcon";
import { useTutorData } from "../../state/tutorStore";
import "./ActivityUI.css";

export function BalanceBanner({ onShop }) {
  const { balance, transactions } = useTutorData();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const income = transactions.filter((item) => item.amount > 0 && new Date(`${item.date}T00:00:00`) >= weekStart)
    .reduce((sum, item) => sum + item.amount, 0);
  return <section className="activity-balance" data-guide-target="credit-balance" aria-label="Saldo kredit">
    <span className="activity-coin"><AppIcon name="bx:coin-stack" size={32} /></span>
    <div><p>Saldo kredit Anda</p><strong key={balance}>{balance} kredit</strong></div>
    {onShop ? <button className="activity-balance-action" onClick={onShop}><AppIcon name="solar:add-circle-linear" size={18} />Isi kredit</button>
      : <span className="activity-income"><strong>+{income} minggu ini</strong><small>Kredit masuk</small></span>}
  </section>;
}
export function EmptyState({ title, description, action, onAction }) {
  return <div className="activity-empty"><AppIcon name="solar:inbox-linear" size={38} /><h3>{title}</h3><p>{description}</p>
    {action && <button className="activity-primary" onClick={onAction}>{action}</button>}</div>;
}
