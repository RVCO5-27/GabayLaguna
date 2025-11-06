// Frontend error monitoring (Sentry); no-op if DSN not provided

let initialized = false;

export function initSentry() {
  if (initialized) return;
  const DSN = import.meta?.env?.VITE_SENTRY_DSN || process.env.REACT_APP_SENTRY_DSN || "";
  if (!DSN) return;
  initialized = true;
  // Dynamically import to avoid adding to initial bundle if unused
  try {
    import('@sentry/browser').then(Sentry => {
      Sentry.init({
        dsn: DSN,
        tracesSampleRate: 0.2,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    }).catch(() => {
      // Silently fail if Sentry can't be loaded
      console.warn('Sentry initialization failed');
    });
  } catch (error) {
    // Handle case where @sentry/browser is not available
    console.warn('Sentry not available:', error);
  }
}


