// The demo expenses require 246 opening credits to leave a balance of 60.
export const demoOpeningCredits = 246;

export function migrateDemoCredits(state) {
  if (state.creditLedgerVersion) return state;
  const transactions = state.transactions.map((item) =>
    item.id === "tx-1" && item.title === "Saldo awal" && item.detail === "Kredit belajar Tutor.in" && item.amount === 60
      ? { ...item, amount: demoOpeningCredits }
      : item
  );
  return { ...state, transactions, creditLedgerVersion: 1 };
}
