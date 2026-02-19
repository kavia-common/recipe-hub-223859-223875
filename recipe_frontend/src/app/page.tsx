"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Api, type Recipe } from "@/lib/api";
import { RecipeCard } from "@/components/RecipeCard";
import { Modal } from "@/components/Modal";
import { RecipeForm } from "@/components/RecipeForm";
import { Toast } from "@/components/Toast";
import { useAuthContext } from "@/components/AuthProvider";

export default function Home() {
  const auth = useAuthContext();

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(
    null
  );

  const tags = useMemo(() => {
    const all = new Set<string>();
    recipes.forEach((r) => (r.tags ?? []).forEach((t) => all.add(t)));
    return Array.from(all).sort((a, b) => a.localeCompare(b));
  }, [recipes]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await Api.recipes.list({
        q: q.trim() || undefined,
        tag: tag.trim() || undefined,
      });
      setRecipes(list);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load recipes";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await load();
  };

  const onCreate = async (draft: Omit<Recipe, "id">) => {
    if (!auth.token) {
      setToast({ kind: "error", message: "Please log in to create recipes." });
      return;
    }
    const created = await Api.recipes.create(auth.token, draft);
    setToast({ kind: "success", message: `Created: ${created.title}` });
    setCreateOpen(false);
    await load();
  };

  return (
    <div className="retro-grid">
      <aside className="card">
        <div className="card-body space-y-4">
          <div>
            <h2 className="card-title">Search</h2>
            <p className="card-subtitle">Find recipes by title/description.</p>
          </div>

          <form onSubmit={onSearch} className="space-y-3">
            <div>
              <label className="label" htmlFor="q">
                Query
              </label>
              <input
                id="q"
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="e.g., pasta"
              />
            </div>

            <div>
              <label className="label" htmlFor="tag">
                Tag
              </label>
              <select
                id="tag"
                className="select"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="">(any)</option>
                {tags.map((t) => (
                  <option value={t} key={t}>
                    #{t}
                  </option>
                ))}
              </select>
              <div className="helper">Tags are derived from loaded recipes.</div>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn btn-primary" type="submit">
                Search
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setQ("");
                  setTag("");
                  load();
                }}
              >
                Reset
              </button>
            </div>
          </form>

          <div className="divider" />

          <div className="space-y-2">
            <h3 className="card-title">Create</h3>
            <p className="card-subtitle">
              Signed-in users can create their own recipes.
            </p>
            <button
              className={`btn btn-primary ${auth.isAuthed ? "" : "opacity-60"}`}
              onClick={() => setCreateOpen(true)}
              disabled={!auth.isAuthed}
            >
              + New Recipe
            </button>
            {!auth.isAuthed ? (
              <p className="helper">Log in to enable creation.</p>
            ) : null}
          </div>

          <div className="divider" />

          <div className="small">
            API base:{" "}
            <span className="kbd">
              {process.env.NEXT_PUBLIC_API_BASE_URL || "(not set)"}
            </span>
          </div>
        </div>
      </aside>

      <section className="space-y-3">
        {toast ? (
          <Toast kind={toast.kind} message={toast.message} onDismiss={() => setToast(null)} />
        ) : null}

        <div className="card">
          <div className="card-body">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="card-title">Browse Recipes</h1>
                <p className="card-subtitle">
                  Retro vibes. Modern cravings. Use search + tags to filter.
                </p>
              </div>
              <button className="btn" onClick={load} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body">
              <p className="small">Loading recipes…</p>
            </div>
          </div>
        ) : error ? (
          <div className="card">
            <div className="card-body">
              <p className="small">Error: {error}</p>
            </div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <p className="small">No recipes found. Try a different query.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>

      <Modal
        title="Create Recipe"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      >
        <RecipeForm
          submitLabel="Create"
          onSubmit={async (draft) => {
            try {
              await onCreate(draft);
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : "Create failed";
              setToast({ kind: "error", message });
            }
          }}
        />
      </Modal>
    </div>
  );
}
