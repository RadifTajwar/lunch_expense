import axios from "axios";
import store from "~/stores"; // <-- your Vuex store entry (make sure index.js exports store)
import { navigateTo } from "#app"; // Nuxt navigation

// Create axios client
const axiosClient = axios.create({
  baseURL: "/api", // you can adjust if needed
  timeout: 5000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach token before request
axiosClient.interceptors.request.use(
  (config) => {
    const token = store.getters["auth/authToken"];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized responses
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      store.dispatch("auth/logOut");
      navigateTo("/");
    }
    return Promise.reject(error);
  }
);

export default function apiRequest(options) {
  return axiosClient.request(options);
}
