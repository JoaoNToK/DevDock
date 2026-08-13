'use client';

import { useEffect } from 'react';

export function SWRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('DevDock ServiceWorker registered successfully:', reg.scope);
          })
          .catch((err) => {
            console.error('DevDock ServiceWorker registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
