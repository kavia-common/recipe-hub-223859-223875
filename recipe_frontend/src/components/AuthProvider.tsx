"use client";

import React, { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

type AuthContextValue = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextValue | null>(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /** Provides auth state to the app (token + current user). */
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuthContext() {
  /** Access auth state from context. */
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider />");
  }
  return ctx;
}
