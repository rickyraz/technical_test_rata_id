import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { getRouter } from './router'; 

if (process.env.NODE_ENV === 'development') {
  // Pastikan path ini benar berdasarkan lokasi folder 'mocks' Anda
  // Anda sudah memiliki folder 'mocks' di 'src/'
  import('./mocks/browser').then(({ worker }) => {
    worker.start();
    console.log('MSW Worker Started');
  });
}

const router = getRouter();

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* Menggunakan RouterProvider untuk TanStack Router */}
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}