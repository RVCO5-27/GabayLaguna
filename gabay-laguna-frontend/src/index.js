import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from './utils/analytics';
import { initSentry } from './utils/sentry';

function AnalyticsRouter({ children }) {
  const location = useLocation();
  useEffect(() => {
    initAnalytics();
    initSentry();
  }, []);
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return children;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AnalyticsRouter>
        <App />
      </AnalyticsRouter>
    </Router>
  </React.StrictMode>
);
