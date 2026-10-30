"use client";
import { useEffect } from "react";

/**
 * Root error boundary — catches fatal errors that occur during root layout
 * rendering. Replaces the entire <html>/<body> when triggered.
 *
 * Without this, any unhandled client-side React error in production renders
 * a near-blank page that looks like "the site didn't load."
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging (Vercel captures this)
    console.error("[arena-global-error]", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen flex items-center justify-center font-sans antialiased">
        <div className="text-center max-w-md p-8">
          <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-glow to-bronze flex items-center justify-center">
            <span className="font-serif font-black text-espresso text-lg">A</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            An unexpected error occurred while loading the page. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 mb-4 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <div className="mt-6">
            <a
              href="/"
              className="text-xs text-muted-foreground hover:text-amber-glow"
            >
              ← Back to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
