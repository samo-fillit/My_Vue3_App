// https://nuxt.com/docs/api/configuration/nuxt-config

// macOS: avoid spawn EBADF from DevTools / file watchers (nuxt/nuxt#33300)
if (process.platform === 'darwin' && !process.env.CHOKIDAR_USEPOLLING) {
  process.env.CHOKIDAR_USEPOLLING = '1'
}

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },

  // Server-side runtime config — not exposed to the browser
  runtimeConfig: {
    // Override with RAILS_URL env var when running against staging/prod
    railsBaseUrl: process.env.RAILS_URL || 'http://localhost:3000',
  },

  css: ['~/assets/css/tailwind.css', 'flag-icons/css/flag-icons.min.css'],
  components: [
    // Skip components/ui/ — shadcn-vue components are imported explicitly
    { path: '~/components', ignore: ['~/components/ui/**'] },
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
  },
})
