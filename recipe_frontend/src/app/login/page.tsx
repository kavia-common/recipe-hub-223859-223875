"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { Toast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(
    null
  );

  useEffect(() => {
    if (auth.isAuthed) router.replace("/");
  }, [auth.isAuthed, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await auth.login(email, password);
    if (res.ok) {
      setToast({ kind: "success", message: "Logged in!" });
      router.push("/");
    } else {
      setToast({ kind: "error", message: res.error });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-3">
      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={() => setToast(null)} />
      ) : null}

      <div className="card">
        <div className="card-body space-y-3">
          <div>
            <h1 className="card-title">Log in</h1>
            <p className="card-subtitle">Access favorites, CRUD, and shopping lists.</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            <button className="btn btn-primary" disabled={auth.loading}>
              {auth.loading ? "Working..." : "Log in"}
            </button>

            {auth.error ? <p className="small">Error: {auth.error}</p> : null}
          </form>
        </div>
      </div>
    </div>
  );
}
