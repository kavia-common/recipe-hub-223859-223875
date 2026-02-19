"use client";

import React, { useEffect } from "react";

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

// PUBLIC_INTERFACE
export function Modal({ title, open, onClose, children }: ModalProps) {
  /** Accessible modal dialog with escape-to-close and backdrop. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl card">
        <div className="card-header">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="card-title">{title}</h2>
              <p className="card-subtitle">Press <span className="kbd">Esc</span> to close</p>
            </div>
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
          <div className="divider" />
        </div>
        <div className="card-body">{children}</div>
      </div>
    </div>
  );
}
