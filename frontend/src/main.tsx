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