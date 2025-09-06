import store from "~/stores";

export default defineNuxtPlugin(() => {
  if (process.client) {
    store.dispatch("auth/loadFromStorage");
  }
});
