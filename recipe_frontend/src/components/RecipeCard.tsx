"use client";

import Link from "next/link";
import React from "react";
import type { Recipe } from "@/lib/api";

type RecipeCardProps = {
  recipe: Recipe;
  rightSlot?: React.ReactNode;
};

// PUBLIC_INTERFACE
export function RecipeCard({ recipe, rightSlot }: RecipeCardProps) {
  /** Small retro recipe card for grid lists. */
  const total =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0) || null;

  return (
    <article className="card">
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="card-title truncate">
              <Link href={`/recipes?id=${encodeURIComponent(recipe.id)}`}>{recipe.title}</Link>
            </h3>
            <p className="card-subtitle line-clamp-2">
              {recipe.description || "No description yet. Add one to make it shine."}
            </p>
          </div>
          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>

        <div className="divider" />

        <div className="flex flex-wrap items-center gap-2">
          {recipe.tags?.length
            ? recipe.tags.slice(0, 4).map((t) => (
                <span className="pill" key={t}>
                  #{t}
                </span>
              ))
            : <span className="small">No tags</span>}
          <span className="small ml-auto">
            {total ? `${total} min total` : "Time not set"}
          </span>
        </div>
      </div>
    </article>
  );
}
