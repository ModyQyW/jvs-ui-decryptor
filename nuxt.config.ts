// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: ["@nuxt/ui", "@nuxtjs/device"],
  colorMode: {
    classSuffix: "",
  },
  ui: {
    icons: ["heroicons", "simple-icons"],
  },
});
