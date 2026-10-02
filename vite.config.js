import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Plain Vite + React + Tailwind. Vercel detects this on its own — no extra settings needed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});

