import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: 'http://localhost:3000/api/',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  },
  plugins: [react(), VitePWA({
    manifest: {
      theme_color: "#757575",
      description: "Découvrez les films diffusés à Rennes cette semaine!",
      name: "Ciné Rennes",
      short_name: "Ciné Rennes",
      screenshots: [
        {
          src: "/mobile_screenshot_home.png",
          form_factor: "narrow",
          sizes: '1290x2796',
          type: "image/png",
          label: "Home Page (Mobile)"
        },
        {
          src: "/mobile_screenshot_day.png",
          form_factor: "narrow",
          sizes: '1290x2796',
          type: "image/png",
          label: "Day by Day (Mobile)"
        },
        {
          src: "/desktop_screenshot.png",
          form_factor: "wide",
          sizes: '3584x2240',
          type: "image/png",
          label: "Home Page (Desktop)"
        }
      ],
    },
    pwaAssets: {
      image: "public/camera.svg"
    },
    registerType: 'autoUpdate'
  })],
})
