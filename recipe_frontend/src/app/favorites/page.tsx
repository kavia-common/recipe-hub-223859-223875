"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Api, type Recipe } from "@/lib/api";
import { RecipeCard } from "@/components/RecipeCard";
import { Toast } from "@/components/Toast";
import { useAuthContext } from "@/components/AuthProvider";

export default function FavoritesPage() {
  const router = useRouter();
  const auth = useAuthContext();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(
    null
  );

  const load = async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const favs = await Api.favorites.list(auth.token);
      setRecipes(favs);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load favorites";
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

  const remove = async (recipe_id: string) => {
    if (!auth.token) return;
    try {
      await Api.favorites.remove(auth.token, recipe_id);
      setRecipes((r) => r.filter((x) => x.id !== recipe_id));
      setToast({ kind: "success", message: "Removed." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Remove failed";
      setToast({ kind: "error", message });
    }
  };

  return (
    <div className="space-y-3">
      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onDismiss={() => setToast(null)} />
      ) : null}

      <div className="card">
        <div className="card-body">
          <h1 className="card-title">Favorites</h1>
          <p className="card-subtitle">Your starred recipes live here.</p>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body">
            <p className="small">Loading…</p>
          </div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p className="small">No favorites yet. Go star something.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              rightSlot={
                <button className="btn btn-danger" onClick={() => remove(r.id)}>
                  Remove
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
