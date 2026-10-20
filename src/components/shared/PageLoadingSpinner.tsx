/**
 * Suspense fallback shown while a lazy route downloads. A polite live region,
 * so screen readers announce that the page is loading.
 */
function PageLoadingSpinner() {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-hidden="true"></div>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}

export default PageLoadingSpinner;
