"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Api, type ShoppingListItem } from "@/lib/api";
import { Toast } from "@/components/Toast";
import { useAuthContext } from "@/components/AuthProvider";

export default function ShoppingListPage() {
  const router = useRouter();
  const auth = useAuthContext();

  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipeIds, setRecipeIds] = useState("");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(
    null
  );

  const uncheckedCount = useMemo(
    () => items.filter((i) => !i.checked).length,
    [items]
  );

  const load = async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const list = await Api.shopping.get(auth.token);
      setItems(list.items ?? []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load shopping list";
      setToast({ kind: "error", message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.loading && !auth.isAuthed) {
      router.replace("/login");
      return;
    }
    if (auth.token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.isAuthed, auth.token]);

  const persist = async (next: ShoppingListItem[]) => {
    if (!auth.token) return;
    setSaving(true);
    try {
      const updated = await Api.shopping.set(auth.token, next);
      setItems(updated.items ?? next);
      setToast({ kind: "success", message: "Saved." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Save failed";
      setToast({ kind: "error", message });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (idx: number) => {
    const next = items.map((it, i) => (i === idx ? { ...it, checked: !it.checked } : it));
    setItems(next);
  };

  const addItem = () => {
    setItems((it) => [...it, { name: "", quantity: "", checked: false }]);
  };

  const removeItem = (idx: number) => {
    setItems((it) => it.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, patch: Partial<ShoppingListItem>) => {
    setItems((it) => it.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  };

  const generateFromRecipeIds = async () => {
    if (!auth.token) return;
    const ids = recipeIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!ids.length) {
      setToast({ kind: "error", message: "Enter at least one recipe ID." });
      return;
    }
    try {
      const list = await Api.shopping.fromRecipes(auth.token, ids);
      setItems(list.items ?? []);
      setToast({ kind: "success", message: "Generated from recipes." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Generate failed";
      setToast({ kind: "error", message });
    }
  };

  return (
    <div className="space-y-3">
      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={() => setToast(null)} />
      ) : null}

      <div className="card">
        <div className="card-body flex items-start justify-between gap-3">
          <div>
            <h1 className="card-title">Shopping List</h1>
            <p className="card-subtitle">
              Check items as you shop. {uncheckedCount} remaining.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button className="btn" onClick={load} disabled={loading}>
              Refresh
            </button>
            <button className="btn" onClick={addItem}>
              + Add item
            </button>
            <button className="btn btn-primary" onClick={() => persist(items)} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-3">
          <h2 className="card-title">Generate from recipes</h2>
          <p className="card-subtitle">
            Paste recipe IDs separated by commas (or use “+ Shopping List” from a recipe page).
          </p>

          <div className="flex flex-col md:flex-row gap-2">
            <input
              className="input flex-1"
              value={recipeIds}
              onChange={(e) => setRecipeIds(e.target.value)}
              placeholder="recipe-id-1, recipe-id-2"
            />
            <button className="btn btn-primary" onClick={generateFromRecipeIds}>
              Generate
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body">
            <p className="small">Loading…</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            {items.length === 0 ? (
              <p className="small">No items yet. Generate from recipes or add items manually.</p>
            ) : (
              <table className="table" aria-label="Shopping list items">
                <thead>
                  <tr>
                    <th>Done</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="checkbox"
                          checked={Boolean(it.checked)}
                          onChange={() => toggle(idx)}
                          aria-label={`Mark ${it.name || "item"} done`}
                        />
                      </td>
                      <td>
                        <input
                          className="input"
                          value={it.name}
                          onChange={(e) => updateItem(idx, { name: e.target.value })}
                          placeholder="e.g., tomatoes"
                        />
                      </td>
                      <td>
                        <input
                          className="input"
                          value={it.quantity ?? ""}
                          onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                          placeholder="e.g., 2"
                        />
                      </td>
                      <td className="text-right">
                        <button className="btn btn-danger" onClick={() => removeItem(idx)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
