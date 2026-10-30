"use client";
import { useEffect } from "react";
import Link from "next/link";

/**
 * Segment-level error boundary — catches errors in route segments below
 * the root layout (preserves the header/footer/navigation).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[arena-error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-bronze/15 border border-bronze/30 flex items-center justify-center">
          <span className="text-amber-glow text-xl">!</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          This page couldn&apos;t load
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          An error occurred while rendering this page. The error has been logged.
          You can try again, or browse other sections.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-bronze/30 text-amber-glow hover:bg-bronze/10 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
