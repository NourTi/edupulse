import { isDesktopRuntime } from "./desktopRuntime";

export type LocalAuthUser = { id: number; institution_id: string; first_name: string; family_name: string; email: string; designation: string; role: string };
export type OwnerRegistrationInput = { first_name: string; family_name: string; birthplace: string; date_of_birth: string; sex: string; institution_name: string; designation: string; email: string; password: string };

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isDesktopRuntime()) throw new Error("Local authentication is available only in the EduPulse Windows app.");
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke<T>(command, args);
}

export function localAuthStatus(): Promise<boolean> { return invoke<boolean>("local_auth_status"); }
export function localRegisterOwner(input: OwnerRegistrationInput): Promise<LocalAuthUser> { return invoke<LocalAuthUser>("local_register_owner", { input }); }
export async function localLogin(email: string, password: string): Promise<{ user: LocalAuthUser; sessionToken: string }> { return invoke<{ user: LocalAuthUser; sessionToken: string }>("local_login", { email, password }); }
export function localLogout(sessionToken: string): Promise<void> { return invoke<void>("local_logout", { sessionToken }); }
