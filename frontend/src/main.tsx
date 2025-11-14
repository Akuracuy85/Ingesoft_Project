// src/main.tsx (o index.tsx)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App.tsx';
import { AuthProvider } from '@/hooks/useAuth.tsx';
import { FilterProvider } from './context/FilterContext';
// import { MetadataProvider } from './context/MetadataContext'; // Si lo usas, descomenta

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FilterProvider>
          {/* <MetadataProvider> Si lo usas, ponlo aquí </MetadataProvider> */}
          <App />
        </FilterProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);