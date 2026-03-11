import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom simula el DOM del navegador para testear componentes React
    environment: 'jsdom',
    // Habilitar globals (describe, it, expect) sin importar
    globals: true,
    // Archivo de setup que agrega los matchers de jest-dom
    setupFiles: ['./tests/setup.ts'],
    // Archivos de test
    include: ['tests/**/*.test.{ts,tsx}'],
    // Excluir carpetas irrelevantes
    exclude: ['node_modules', 'dist'],
    // CSS mock — evita errores al importar .css en componentes
    css: false,
  },
});
