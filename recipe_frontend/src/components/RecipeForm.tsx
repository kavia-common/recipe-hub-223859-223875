"use client";

import React, { useMemo, useState } from "react";
import type { Recipe } from "@/lib/api";

type RecipeDraft = Omit<Recipe, "id">;

type RecipeFormProps = {
  initial?: Partial<RecipeDraft>;
  submitLabel: string;
  onSubmit: (draft: RecipeDraft) => Promise<void> | void;
};

// PUBLIC_INTERFACE
export function RecipeForm({ initial, submitLabel, onSubmit }: RecipeFormProps) {
  /** Controlled recipe form for create/edit. */
  const initialDraft = useMemo<RecipeDraft>(
    () => ({
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      image_url: initial?.image_url ?? "",
      prep_time_minutes: initial?.prep_time_minutes ?? null,
      cook_time_minutes: initial?.cook_time_minutes ?? null,
      servings: initial?.servings ?? null,
      ingredients: initial?.ingredients ?? [""],
      steps: initial?.steps ?? [""],
      tags: initial?.tags ?? [],
      author_id: initial?.author_id ?? null,
      created_at: initial?.created_at,
      updated_at: initial?.updated_at,
    }),
    [initial]
  );

  const [draft, setDraft] = useState<RecipeDraft>(initialDraft);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = draft.title.trim().length > 0;

  const setIngredient = (idx: number, value: string) => {
    setDraft((d) => {
      const ingredients = [...d.ingredients];
      ingredients[idx] = value;
      return { ...d, ingredients };
    });
  };

  const addIngredient = () =>
    setDraft((d) => ({ ...d, ingredients: [...d.ingredients, ""] }));

  const removeIngredient = (idx: number) =>
    setDraft((d) => ({
      ...d,
      ingredients: d.ingredients.filter((_, i) => i !== idx),
    }));

  const setStep = (idx: number, value: string) => {
    setDraft((d) => {
      const steps = [...d.steps];
      steps[idx] = value;
      return { ...d, steps };
    });
  };

  const addStep = () => setDraft((d) => ({ ...d, steps: [...d.steps, ""] }));

  const removeStep = (idx: number) =>
    setDraft((d) => ({ ...d, steps: d.steps.filter((_, i) => i !== idx) }));

  const setTags = (value: string) => {
    const tags = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setDraft((d) => ({ ...d, tags }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    // Normalize empty items.
    const normalized: RecipeDraft = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description?.trim() || null,
      image_url: draft.image_url?.trim() || null,
      ingredients: draft.ingredients.map((s) => s.trim()).filter(Boolean),
      steps: draft.steps.map((s) => s.trim()).filter(Boolean),
      tags: draft.tags?.map((s) => s.trim()).filter(Boolean) ?? [],
    };

    setSubmitting(true);
    try {
      await onSubmit(normalized);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="title">
          Title *
        </label>
        <input
          id="title"
          className="input"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="e.g., Pixel Pasta Primavera"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="textarea"
          value={draft.description ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          placeholder="Short summary..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="label" htmlFor="prep">
            Prep (min)
          </label>
          <input
            id="prep"
            className="input"
            inputMode="numeric"
            value={draft.prep_time_minutes ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                prep_time_minutes: e.target.value ? Number(e.target.value) : null,
              }))
            }
            placeholder="10"
          />
        </div>
        <div>
          <label className="label" htmlFor="cook">
            Cook (min)
          </label>
          <input
            id="cook"
            className="input"
            inputMode="numeric"
            value={draft.cook_time_minutes ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                cook_time_minutes: e.target.value ? Number(e.target.value) : null,
              }))
            }
            placeholder="20"
          />
        </div>
        <div>
          <label className="label" htmlFor="servings">
            Servings
          </label>
          <input
            id="servings"
            className="input"
            inputMode="numeric"
            value={draft.servings ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                servings: e.target.value ? Number(e.target.value) : null,
              }))
            }
            placeholder="2"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="imageUrl">
          Image URL (optional)
        </label>
        <input
          id="imageUrl"
          className="input"
          value={draft.image_url ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
          placeholder="https://..."
        />
        <div className="helper">Image upload is optional; use a URL for now.</div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label className="label">Ingredients</label>
          <button type="button" className="btn" onClick={addIngredient}>
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {draft.ingredients.map((val, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                className="input"
                value={val}
                onChange={(e) => setIngredient(idx, e.target.value)}
                placeholder="e.g., 200g spaghetti"
              />
              {draft.ingredients.length > 1 ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeIngredient(idx)}
                  aria-label="Remove ingredient"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label className="label">Steps</label>
          <button type="button" className="btn" onClick={addStep}>
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {draft.steps.map((val, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                className="input"
                value={val}
                onChange={(e) => setStep(idx, e.target.value)}
                placeholder={`Step ${idx + 1}`}
              />
              {draft.steps.length > 1 ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeStep(idx)}
                  aria-label="Remove step"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="tags">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          className="input"
          value={(draft.tags ?? []).join(", ")}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., quick, vegetarian, retro"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className={`btn btn-primary ${!canSubmit ? "opacity-60" : ""}`} disabled={!canSubmit || submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
