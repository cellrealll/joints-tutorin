import { backendSnapshot, backendAction, request } from "./backend";
export function careerAccountAvailable() { return backendSnapshot().phase === "ready"; }
export function saveCareerToAccount(state, target) {
  return backendAction("/career/profile", { version: 1, target, state }, "PUT");
}
export async function loadCareerFromAccount() { return (await request("/career/profile")).data; }
