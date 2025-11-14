import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Serve static HTML files
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        planets: './planets.html',
        constellations: './constellations.html',
        missions: './missions.html',
        quizzes: './quizzes.html',
        auth: './auth.html',
      }
    }
  }
})
