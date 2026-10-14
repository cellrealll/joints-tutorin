import { useSyncExternalStore } from "react";

const key = "tutorin-favorites";
const listeners = new Set();
function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? [...new Set(saved.filter((name) => typeof name === "string"))] : [];
  } catch { return []; }
}
let favorites = readFavorites();
const getSnapshot = () => favorites;
function notify() { listeners.forEach((listener) => listener()); }
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
window.addEventListener("storage", (event) => {
  if (event.key === key || event.key === null) {
    favorites = readFavorites();
    notify();
  }
});

export function toggleFavorite(name) {
  const next = favorites.includes(name) ? favorites.filter((item) => item !== name) : [...favorites, name];
  localStorage.setItem(key, JSON.stringify(next));
  favorites = next;
  notify();
}

export function useFavorites() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
