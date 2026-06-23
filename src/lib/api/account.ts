import { apiFetch } from "./client";

/**
 * Cierra (borra) la cuenta del usuario actual. En el backend esto anonimiza la
 * PII y marca la cuenta como borrada; los datos se conservan para analítica.
 */
export async function deleteAccount(): Promise<void> {
  const response = await apiFetch("/auth/account", { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`Failed to delete account: ${response.status}`);
  }
}
