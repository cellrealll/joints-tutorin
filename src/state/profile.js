import { documentStorage } from "./backend";
import { useSyncExternalStore } from "react";

const key = "tutorin-profile";
const initialProfile = {
  firstName: "Anna", lastName: "Ratna", email: "alya.putri@email.com",
  phone: "+62 812 3456 7890", city: "Jakarta, Indonesia",
  birthday: "2000-05-15", username: "alyaputri123",
  mentorActive: true,
};
function loadProfile() {
  try {
    const saved = JSON.parse(documentStorage.getItem(key));
    return Object.fromEntries(Object.entries(initialProfile).map(([field, value]) => [
      field, typeof saved?.[field] === typeof value ? saved[field] : value,
    ]));
  } catch { return initialProfile; }
}
let profile = loadProfile();
const listeners = new Set();
const getSnapshot = () => profile;
function notify() { listeners.forEach((listener) => listener()); }
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
window.addEventListener("storage", (event) => {
  if (event.key === key || event.key === null) { profile = loadProfile(); notify(); }
});
export function updateProfile(next) {
  documentStorage.setItem(key, JSON.stringify(next));
  profile = next;
  notify();
}
export function useProfile() { return useSyncExternalStore(subscribe, getSnapshot); }
