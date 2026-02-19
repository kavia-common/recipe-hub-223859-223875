"use client";

import React from "react";

type ToastProps = {
  kind: "success" | "error";
  message: string;
  onDismiss?: () => void;
};

// PUBLIC_INTERFACE
export function Toast({ kind, message, onDismiss }: ToastProps) {
  /** Lightweight toast UI (place in page top area). */
  return (
    <div className={`toast ${kind === "success" ? "toast-success" : "toast-error"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>{message}</div>
        {onDismiss ? (
          <button className="btn btn-ghost" onClick={onDismiss}>
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
