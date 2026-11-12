import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración Vite para StudyRoom Frontend (Sprint 1)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});

