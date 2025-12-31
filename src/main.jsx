console.log('🚀 main.jsx is loading...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProductProvider } from '@/contexts/ProductContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { GridDebugProvider } from '@/contexts/GridDebugContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { AdminToolsProvider } from '@/contexts/AdminToolsContext';
import App from '@/App';
import '@/index.css';

console.log('📦 All imports loaded successfully');

console.log('🎯 About to render React app...');

window.__GRAFIC_REACT_MOUNTED__ = false;

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AdminProvider>
      <AdminToolsProvider>
        <GridDebugProvider>
          <ProductProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ProductProvider>
        </GridDebugProvider>
      </AdminToolsProvider>
    </AdminProvider>
  </BrowserRouter>
);

window.__GRAFIC_REACT_MOUNTED__ = true;

console.log('✅ React app rendered');

// Registre del Service Worker per PWA
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrat correctament:', registration);
        })
        .catch((error) => {
          console.log('❌ Error al registrar Service Worker:', error);
        });
    });
  } else {
    // DEV: evita que un SW antic segresti assets cachejats i impedeixi veure canvis.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    if ('caches' in window) {
      caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
    }
  }
}
