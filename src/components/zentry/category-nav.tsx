"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  activeSlug?: string;
  className?: string;
}

export function CategoryNav({ activeSlug, className }: CategoryNavProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <nav aria-label="Categories" className={cn("space-y-0.5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-amber-glow">
          Sections
        </h2>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {CATEGORIES.length} topics
        </span>
      </div>

      {CATEGORIES.map((cat) => {
        const isActive = activeSlug === cat.slug;
        const isOpen = openSlug === cat.slug;
        return (
          <div key={cat.id}>
            <div className="flex items-stretch">
              <Link
                href={`/category/${cat.slug}`}
                className={cn(
                  "group flex flex-1 items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-bronze/20 text-amber-glow font-medium"
                    : "text-foreground/80 hover:bg-graphite/60 hover:text-foreground",
                )}
              >
                <span
                  className="w-1.5 h-5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate">{cat.name}</span>
              </Link>
              {cat.subcategories.length > 0 && (
                <button
                  onClick={() => setOpenSlug(isOpen ? null : cat.slug)}
                  className="px-2 text-muted-foreground hover:text-amber-glow transition-colors"
                  aria-label={`Toggle ${cat.name} subcategories`}
                  aria-expanded={isOpen}
                >
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              )}
            </div>

            {isOpen && cat.subcategories.length > 0 && (
              <ul className="ml-4 pl-4 border-l border-bronze/15 my-1 space-y-0.5">
                {cat.subcategories.map((sub) => (
                  <li key={sub}>
                    <Link
                      href={`/category/${cat.slug}?sub=${encodeURIComponent(sub)}`}
                      className="block px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-amber-glow hover:bg-graphite/40 transition-colors"
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
