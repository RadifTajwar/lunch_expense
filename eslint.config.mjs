export default {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "plugin:vue/vue3-recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    // ✅ Allow Vue 3 v-model arguments (needed for PrimeVue)
    "vue/no-v-model-argument": "off",
  },
};
