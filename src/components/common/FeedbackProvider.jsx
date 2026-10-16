import { useCallback, useEffect, useRef, useState } from 'react';
import { FeedbackContext } from '../../state/feedbackContext';
import './FeedbackProvider.css';

export default function FeedbackProvider({ children, onShop }) {
  const [feedback, setFeedback] = useState(null);
  const dialog = useRef(null);
  const show = useCallback((value) => setFeedback(value), []);
  const credit = useCallback((balance, required) => setFeedback({
    kind: 'credit', title: balance <= 0 ? 'Kredit kamu habis' : 'Kredit belum cukup',
    message: `Saldo kamu ${Math.max(0, balance)} kredit. Sesi ini membutuhkan ${required} kredit. Isi kredit terlebih dahulu untuk melanjutkan booking.`,
    actionLabel: 'Isi kredit', onAction: onShop,
  }), [onShop]);
  useEffect(() => {
    if (feedback && !dialog.current?.open) dialog.current?.showModal();
  }, [feedback]);
  return <FeedbackContext.Provider value={{ show, credit }}>
    {children}
    {feedback && <dialog className={`action-feedback ${feedback.kind || 'success'}`} ref={dialog} onClose={() => setFeedback(null)} aria-labelledby="action-feedback-title" aria-describedby="action-feedback-message">
      <button type="button" className="action-feedback-close" aria-label="Tutup feedback" onClick={() => setFeedback(null)}>×</button>
      <div className="action-feedback-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" width="38" height="38">
        {feedback.kind === 'credit' ? <><rect x="3" y="7" width="26" height="20" rx="5" stroke="currentColor" strokeWidth="2.5" /><path d="M8 7V5h16v2M22 16h7v6h-7a3 3 0 0 1 0-6Z" stroke="currentColor" strokeWidth="2.5" /><circle cx="23" cy="19" r="1" fill="currentColor" /></> : <><circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" /><path d="m10 16 4 4 8-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></>}
      </svg></div>
      <h2 id="action-feedback-title">{feedback.title}</h2>
      <p id="action-feedback-message">{feedback.message}</p>
      <div className="action-feedback-buttons">
        {feedback.onAction && <button type="button" className="activity-primary" onClick={() => { const action = feedback.onAction; setFeedback(null); action(); }}>{feedback.actionLabel}</button>}
        <button type="button" className="activity-outline" onClick={() => setFeedback(null)}>{feedback.kind === 'credit' ? 'Nanti dulu' : 'Tutup'}</button>
      </div>
    </dialog>}
  </FeedbackContext.Provider>;
}
