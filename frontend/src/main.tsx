// src/main.tsx (o index.tsx)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App.tsx';
import { AuthProvider } from '@/hooks/useAuth.tsx';
import { FilterProvider } from './context/FilterContext';
import { Bounce, ToastContainer } from 'react-toastify';
// import { MetadataProvider } from './context/MetadataContext'; // Si lo usas, descomenta
import { CompraGuardProvider } from "@/context/CompraGuardContext";

// Apply theme before React mounts so initial UI (Loading, overlays) use correct theme.
// Reads localStorage 'theme' which may be 'dark' | 'light' | 'system'. If 'system'
// or missing, uses the OS preference at load time.
;(function initThemeBeforeMount() {
  try {
    const root = document.documentElement;
    const stored = localStorage.getItem('theme');
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored === 'dark') {
      root.classList.add('dark');
    } else if (stored === 'light') {
      root.classList.remove('dark');
    } else {
      // treat any other value (including null) as 'system'
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  } catch (e) {
    // ignore errors (e.g., SSR or restricted storage)
    // ensure we don't crash the app initialization
    // console.warn('Theme init error', e);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FilterProvider>
          <CompraGuardProvider> {/* 🔹 Aquí */}
          {/* <MetadataProvider> Si lo usas, ponlo aquí </MetadataProvider> */}
            <App />
            <ToastContainer position="top-right"
              autoClose={5000}
              hideProgressBar
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              transition={Bounce} />
          </CompraGuardProvider>
        </FilterProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);