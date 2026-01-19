import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell-app',
      remotes: {
        assetsMfe: 'http://localhost:4101/assets/remoteEntry.js',
        dashboardMfe: 'http://localhost:4102/assets/remoteEntry.js',
        usersMfe: 'http://localhost:4103/assets/remoteEntry.js',
        tenantsMfe: 'http://localhost:4104/assets/remoteEntry.js',
        auditMfe: 'http://localhost:4105/assets/remoteEntry.js',
        reportsMfe: 'http://localhost:4106/assets/remoteEntry.js',
        settingsMfe: 'http://localhost:4107/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  server: {
    port: 4100,
    cors: true,
  },
  preview: {
    port: 4100,
    cors: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
