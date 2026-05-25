// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
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
