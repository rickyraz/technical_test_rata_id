// src/client.tsx
import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

if (import.meta.env.DEV) {
  // Ganti path sesuai lokasi file mocks/browser.ts Anda
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      // Opsional: konfigurasi tambahan MSW, misalnya bypass unhandled requests
      onUnhandledRequest: 'bypass',
    });
    console.log('MSW Worker Started');
  });
}

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
)

// Dengan cara ini, MSW akan aktif hanya di browser saat development, dan semua request API akan di-mock sesuai handlers Anda. 
// Jika ada masalah, cek console browser untuk pesan dari MSW.