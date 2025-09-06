import { defineNuxtConfig } from "nuxt/config";
import ToastService from "primevue/toastservice";
import Aura from "@primeuix/themes/aura";

export default defineNuxtConfig({
  modules: [
    "nuxt-vue3-google-signin",
    "@nuxtjs/tailwindcss",
    [
      "@primevue/nuxt-module",
      {
        options: {
          theme: {
            preset: Aura, // 👈 using Aura theme
          },
        },
        use: [ToastService], // 👈 register Toast service here
      },
    ],
  ],
  compatibilityDate: "2025-09-06",
  css: [
    "~/assets/css/tailwind.css",
    "primeicons/primeicons.css", // ✅ only keep this for icons
  ],
  googleSignIn: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  runtimeConfig: {
    MONGO_URI: process.env.MONGO_URI,
  },
});
