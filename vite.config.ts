import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel';
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    babel({
      babelConfig: {
        plugins: [
          ["@babel/plugin-proposal-optional-chaining-assign", { "version": "2023-07" }]
        ]
      }
    }),
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
})
