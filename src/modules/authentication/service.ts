import { apiRequest } from "../../lib/api";
import type { AuthResult, Customer, LoginInput, RegisterInput, Session } from "./types";

const SESSION_KEY = "foodieSession";

export const authenticationService = {
  login: (input: LoginInput) => apiRequest<AuthResult>("/api/login", { method: "POST", body: JSON.stringify(input) }),
  register: (input: RegisterInput) => apiRequest<AuthResult>("/api/users", { method: "POST", body: JSON.stringify(input) }),
  listCustomers: () => apiRequest<Customer[]>("/api/users"),
  loadSession(): Session | null { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as Session | null; } catch { return null; } },
  saveSession(session: Session, token?: string) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); localStorage.setItem("foodieCustomerId", String(session.id)); if (token) localStorage.setItem("foodieToken", token); },
  clearSession() { localStorage.removeItem(SESSION_KEY); localStorage.removeItem("foodieToken"); },
  createSession(result: AuthResult, input: Record<string, FormDataEntryValue>, fallbackId: number): Session {
    const roleText = String(result.role ?? result.user?.role ?? result.customer?.role ?? "").toLowerCase();
    const role = roleText.includes("admin") || String(input.email).toLowerCase().includes("admin") ? "admin" : "user";
    return { id: result.customerId ?? result.userId ?? fallbackId, name: result.name ?? result.user?.name ?? result.customer?.name ?? String(input.name ?? (role === "admin" ? "Admin" : "Foodie")), email: String(input.email), role };
  },
};
