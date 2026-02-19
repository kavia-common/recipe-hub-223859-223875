"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Api, type Recipe } from "@/lib/api";
import { useAuthContext } from "@/components/AuthProvider";
import { RecipeCard } from "@/components/RecipeCard";
import { Modal } from "@/components/Modal";
import { RecipeForm } from "@/components/RecipeForm";
import { Toast } from "@/components/Toast";

export default function MyRecipesPage() {
  const router = useRouter();
  const auth = useAuthContext();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(
    null
  );
  const [createOpen, setCreateOpen] = useState(false);

  const myRecipes = useMemo(() => {
    if (!auth.user?.id) return recipes;
    // If backend doesn't set author_id, fall back to showing everything.
    const anyHasAuthor = recipes.some((r) => r.author_id);
    if (!anyHasAuthor) return recipes;
    return recipes.filter((r) => r.author_id === auth.user?.id);
  }, [recipes, auth.user?.id]);

  const load = async () => {
    setLoading(true);
    try {
      const list = await Api.recipes.list();
      setRecipes(list);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load recipes";
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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.isAuthed]);

  const onCreate = async (draft: Omit<Recipe, "id">) => {
    if (!auth.token) return;
    const created = await Api.recipes.create(auth.token, draft);
    setToast({ kind: "success", message: `Created: ${created.title}` });
    setCreateOpen(false);
    await load();
  };

  return (
    <div className="space-y-3">
      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={() => setToast(null)} />
      ) : null}

      <div className="card">
        <div className="card-body flex items-start justify-between gap-3">
          <div>
            <h1 className="card-title">My Recipes</h1>
            <p className="card-subtitle">
              Recipes you’ve created (or all recipes if author info isn’t available).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn" onClick={load} disabled={loading}>
              Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              + New
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
      ) : myRecipes.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p className="small">No recipes yet. Create your first one.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}

      <Modal title="Create Recipe" open={createOpen} onClose={() => setCreateOpen(false)}>
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
