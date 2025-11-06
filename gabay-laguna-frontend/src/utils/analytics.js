// Lightweight analytics wrapper (GA4-ready, no-op if ID missing)

const GA4_ID = import.meta?.env?.VITE_GA4_ID || process.env.REACT_APP_GA4_ID || "";

export function initAnalytics() {
  if (!GA4_ID || typeof window === "undefined") return;
  if (window.dataLayer) return; // already initialized
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA4_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
}

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag('event', name, params);
}

export function trackPageView(pathname) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: pathname });
}


