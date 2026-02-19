"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Api, type User } from "@/lib/api";

const TOKEN_KEY = "recipehub_token";

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
};

// PUBLIC_INTERFACE
export function useAuth() {
  /** Client-side auth state (token stored in localStorage). */
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;

    if (!token) {
      setState((s) => ({ ...s, token: null, user: null, loading: false }));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = await Api.auth.me(token);
        if (cancelled) return;
        setState({ token, user: me, loading: false, error: null });
      } catch (e: unknown) {
        if (cancelled) return;
        window.localStorage.removeItem(TOKEN_KEY);
        const message = e instanceof Error ? e.message : "Failed to restore session";
        setState({
          token: null,
          user: null,
          loading: false,
          error: message,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setToken = useCallback((token: string | null) => {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await Api.auth.login(email, password);
      setToken(res.access_token);
      const me = res.user ?? (await Api.auth.me(res.access_token));
      setState({ token: res.access_token, user: me, loading: false, error: null });
      return { ok: true as const };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Login failed";
      setState((s) => ({ ...s, loading: false, error: message }));
      return { ok: false as const, error: message };
    }
  }, [setToken]);

  const signup = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await Api.auth.signup(email, password, displayName);
        setToken(res.access_token);
        const me = res.user ?? (await Api.auth.me(res.access_token));
        setState({ token: res.access_token, user: me, loading: false, error: null });
        return { ok: true as const };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Signup failed";
        setState((s) => ({
          ...s,
          loading: false,
          error: message,
        }));
        return { ok: false as const, error: message };
      }
    },
    [setToken]
  );

  const logout = useCallback(() => {
    setToken(null);
    setState({ token: null, user: null, loading: false, error: null });
  }, [setToken]);

  const value = useMemo(
    () => ({
      ...state,
      isAuthed: Boolean(state.token),
      login,
      signup,
      logout,
    }),
    [state, login, signup, logout]
  );

  return value;
}
