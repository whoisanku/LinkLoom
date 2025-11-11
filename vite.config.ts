
import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://paid4.daki.cc:4008",
        changeOrigin: true,
        secure: false,
      },
      "/garplet-jobs": {
        target: "http://localhost:5173",
        changeOrigin: true,
        secure: false,
      },
      "/fc": {
        target: "https://client.farcaster.xyz",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/fc/, ""),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@module': path.resolve(__dirname, './src/components/module'),
      '@layout': path.resolve(__dirname, './src/components/layout'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@type': path.resolve(__dirname, './src/types'),
      '@config': path.resolve(__dirname, './src/config'),
      
      '@features': path.resolve(__dirname, './src/features'),
      '@features/components': path.resolve(__dirname, './src/features/components'),
      '@features/hooks': path.resolve(__dirname, './src/features/hooks'),
      '@features/store': path.resolve(__dirname, './src/features/store'),
      
    },
   
  },
})


