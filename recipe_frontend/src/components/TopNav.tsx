"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useAuthContext } from "@/components/AuthProvider";

// PUBLIC_INTERFACE
export function TopNav() {
  /** Sticky top nav with retro styling + auth quick actions. */
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuthContext();

  const items = useMemo(
    () => [
      { href: "/", label: "Browse" },
      { href: "/favorites", label: "Favorites" },
      { href: "/shopping-list", label: "Shopping List" },
      { href: "/my-recipes", label: "My Recipes" },
    ],
    []
  );

  return (
    <header className="retro-topbar">
      <div className="retro-topbar-inner">
        <div className="retro-brand">
          <Link href="/" className="retro-logo">
            Recipe Hub
          </Link>
          <span className="retro-badge">retro UI</span>
        </div>

        <nav className="retro-nav" aria-label="Primary">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="retro-link"
              data-active={pathname === it.href}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {auth.loading ? (
            <span className="small">Loading…</span>
          ) : auth.isAuthed ? (
            <>
              <span className="pill" title={auth.user?.email ?? ""}>
                {auth.user?.display_name || auth.user?.email || "Signed in"}
              </span>
              <button
                className="btn"
                onClick={() => {
                  auth.logout();
                  router.push("/");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-primary" href="/login">
                Log in
              </Link>
              <Link className="btn" href="/signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
