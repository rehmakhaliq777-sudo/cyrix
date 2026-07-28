import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:       path.resolve(import.meta.dirname, 'index.html'),
        password:   path.resolve(import.meta.dirname, 'password.html'),
        phishing:   path.resolve(import.meta.dirname, 'phishing.html'),
        malware:    path.resolve(import.meta.dirname, 'malware.html'),
        quiz:       path.resolve(import.meta.dirname, 'quiz.html'),
        toolkit:    path.resolve(import.meta.dirname, 'toolkit.html'),
        profile:    path.resolve(import.meta.dirname, 'profile.html'),
        encryption: path.resolve(import.meta.dirname, 'encryption.html'),
        contact:    path.resolve(import.meta.dirname, 'contact.html'),
      },
    },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: process.env.PORT ? Number(process.env.PORT) : 4173,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
