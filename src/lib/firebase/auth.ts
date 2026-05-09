/**
 * @module auth
 * Serviço de autenticação — usado APENAS pelo painel admin.
 * Clientes não fazem login nesta versão de loja física.
 */

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";

/* ─── Admin Auth ─── */

export async function adminSignIn(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function adminSignOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/* ─── Error messages ─── */

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-not-found": "Usuário não encontrado.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/network-request-failed": "Sem conexão com a internet.",
  "auth/invalid-credential": "E-mail ou senha inválidos.",
};

export function normalizeAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: string }).code)
      : "unknown";
  return AUTH_ERRORS[code] ?? "Ocorreu um erro. Tente novamente.";
}
