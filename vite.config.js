import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plain Vite + React. Vercel detects this on its own — no extra settings needed.
export default defineConfig({
  plugins: [react()],
});
