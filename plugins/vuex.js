import store from "~/stores";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(store);
  nuxtApp.provide("store", store); // so you can inject if needed
});
