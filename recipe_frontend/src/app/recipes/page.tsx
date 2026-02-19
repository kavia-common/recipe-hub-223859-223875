"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Api, type Recipe } from "@/lib/api";
import { useAuthContext } from "@/components/AuthProvider";
import { Modal } from "@/components/Modal";
import { RecipeForm } from "@/components/RecipeForm";
import { Toast } from "@/components/Toast";

function RecipeViewerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuthContext();

  const id = searchParams.get("id") ?? "";

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(
    null
  );

  const [editOpen, setEditOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await Api.recipes.get(id);
      setRecipe(r);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load recipe";
      setToast({ kind: "error", message });
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!auth.token) return;
    try {
      const favs = await Api.favorites.list(auth.token);
      setFavorites(new Set(favs.map((f) => f.id)));
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  const isFav = useMemo(
    () => (recipe ? favorites.has(recipe.id) : false),
    [recipe, favorites]
  );

  const toggleFavorite = async () => {
    if (!auth.token || !recipe) {
      setToast({ kind: "error", message: "Log in to use favorites." });
      return;
    }
    try {
      if (favorites.has(recipe.id)) {
        await Api.favorites.remove(auth.token, recipe.id);
        setFavorites((s) => {
          const next = new Set(s);
          next.delete(recipe.id);
          return next;
        });
        setToast({ kind: "success", message: "Removed from favorites." });
      } else {
        await Api.favorites.add(auth.token, recipe.id);
        setFavorites((s) => new Set(s).add(recipe.id));
        setToast({ kind: "success", message: "Added to favorites!" });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Favorite action failed";
      setToast({ kind: "error", message });
    }
  };

  const addToShoppingList = async () => {
    if (!auth.token || !recipe) {
      setToast({ kind: "error", message: "Log in to create shopping lists." });
      return;
    }
    try {
      await Api.shopping.fromRecipes(auth.token, [recipe.id]);
      setToast({ kind: "success", message: "Shopping list updated from this recipe." });
      router.push("/shopping-list");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Shopping list update failed";
      setToast({ kind: "error", message });
    }
  };

  const updateRecipe = async (draft: Omit<Recipe, "id">) => {
    if (!auth.token || !recipe) return;
    const updated = await Api.recipes.update(auth.token, recipe.id, draft);
    setRecipe(updated);
    setToast({ kind: "success", message: "Recipe updated." });
    setEditOpen(false);
  };

  const deleteRecipe = async () => {
    if (!auth.token || !recipe) return;
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    try {
      await Api.recipes.remove(auth.token, recipe.id);
      setToast({ kind: "success", message: "Recipe deleted." });
      router.push("/");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Delete failed";
      setToast({ kind: "error", message });
    }
  };

  if (!id) {
    return (
      <div className="card">
        <div className="card-body">
          <h1 className="card-title">Recipe Viewer</h1>
          <p className="card-subtitle">Open a recipe by providing an id in the URL.</p>
          <div className="divider" />
          <p className="small">
            Example: <span className="kbd">/recipes?id=RECIPE_ID</span>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="small">Loading…</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="small">Recipe not found.</p>
          <div className="divider" />
          <p className="small">
            Requested id: <span className="kbd">{id}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {toast ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      ) : null}

      <div className="card">
        <div className="card-body space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="card-title">{recipe.title}</h1>
              <p className="card-subtitle">{recipe.description || "No description."}</p>
              <p className="small">
                id: <span className="kbd">{recipe.id}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button className="btn" onClick={toggleFavorite}>
                {isFav ? "★ Favorited" : "☆ Favorite"}
              </button>
              <button className="btn btn-primary" onClick={addToShoppingList}>
                + Shopping List
              </button>
              {auth.isAuthed ? (
                <>
                  <button className="btn" onClick={() => setEditOpen(true)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={deleteRecipe}>
                    Delete
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(recipe.tags ?? []).length ? (
              (recipe.tags ?? []).map((t) => (
                <span className="pill" key={t}>
                  #{t}
                </span>
              ))
            ) : (
              <span className="small">No tags</span>
            )}
          </div>

          <div className="divider" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="card">
              <div className="card-body">
                <div className="small">Prep</div>
                <div className="card-title">{recipe.prep_time_minutes ?? "—"} min</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="small">Cook</div>
                <div className="card-title">{recipe.cook_time_minutes ?? "—"} min</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="small">Servings</div>
                <div className="card-title">{recipe.servings ?? "—"}</div>
              </div>
            </div>
          </div>

          {recipe.image_url ? (
            <div className="card">
              <div className="card-body">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={recipe.image_url}
                  alt={`${recipe.title} image`}
                  className="w-full h-auto rounded-xl border-2 border-[var(--border)]"
                />
              </div>
            </div>
          ) : null}

          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Ingredients</h2>
              <div className="divider" />
              {recipe.ingredients.length ? (
                <ul className="list-disc pl-5 space-y-1">
                  {recipe.ingredients.map((it, idx) => (
                    <li key={idx} className="small">
                      {it}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="small">No ingredients listed.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Steps</h2>
              <div className="divider" />
              {recipe.steps.length ? (
                <ol className="list-decimal pl-5 space-y-1">
                  {recipe.steps.map((it, idx) => (
                    <li key={idx} className="small">
                      {it}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="small">No steps listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal title="Edit Recipe" open={editOpen} onClose={() => setEditOpen(false)}>
        <RecipeForm
          initial={recipe}
          submitLabel="Save"
          onSubmit={async (draft) => {
            try {
              await updateRecipe(draft);
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : "Update failed";
              setToast({ kind: "error", message });
            }
          }}
        />
      </Modal>
    </div>
  );
}

export default function RecipeViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="card">
          <div className="card-body">
            <p className="small">Loading recipe viewer…</p>
          </div>
        </div>
      }
    >
      <RecipeViewerInner />
    </Suspense>
  );
}
