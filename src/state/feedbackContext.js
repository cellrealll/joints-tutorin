import { createContext, useContext } from 'react';
export const FeedbackContext = createContext({ show: () => {}, credit: () => {} });
export const useFeedback = () => useContext(FeedbackContext);
export const isCreditError = (error) => error?.code === 'INSUFFICIENT_CREDITS' || /kredit.*(belum cukup|tidak cukup|habis)/i.test(error?.message || '');
