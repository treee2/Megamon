// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Настраиваем алиас @, чтобы он указывал на папку src
      // Теперь вместо import ... from '../../components/ui/button'
      // можно писать import ... from '@/components/ui/button'
      '@': path.resolve('./src'),
    },
  },
})