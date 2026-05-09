"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { adminSignIn, adminSignOut, onAuthChange, normalizeAuthError } from "@/lib/firebase/auth";

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);
        await adminSignIn(email, password);
        router.push("/admin");
      } catch (err) {
        setError(normalizeAuthError(err));
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await adminSignOut();
    router.push("/admin/login");
  }, [router]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    clearError: () => setError(null),
  };
}
