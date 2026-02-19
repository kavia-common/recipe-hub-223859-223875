"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { Toast } from "@/components/Toast";

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuthContext();

  const [displayName, setDisplayName] = useState("");
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
    const res = await auth.signup(email, password, displayName || undefined);
    if (res.ok) {
      setToast({ kind: "success", message: "Account created!" });
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
            <h1 className="card-title">Sign up</h1>
            <p className="card-subtitle">Create an account to save favorites and recipes.</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label" htmlFor="displayName">
                Display name (optional)
              </label>
              <input
                id="displayName"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="nickname"
              />
            </div>

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
                autoComplete="new-password"
                required
              />
              <div className="helper">Use a strong password. Minimum rules depend on backend.</div>
            </div>

            <button className="btn btn-primary" disabled={auth.loading}>
              {auth.loading ? "Working..." : "Create account"}
            </button>

            {auth.error ? <p className="small">Error: {auth.error}</p> : null}
          </form>
        </div>
      </div>
    </div>
  );
}
