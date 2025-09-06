import { stringify, parse } from "zipson";
import apiRequest from "~/utils/apiRequest";
import { AUTH_URL } from "~/config/apiEndPoints";
import { PERMISSIONS } from "@/constants/permissions";

export default {
  namespaced: true,

  state: () => ({
    token: "",
    user: null,
    loggingIn: false,
  }),

  getters: {
    isLoggingIn: (state) => state.loggingIn,
    isLoggedIn: (state) => !!state.token,
    authToken: (state) => state.token,
    userId: (state) => state.user?.id || "",
    userName: (state) => state.user?.name || "",
    userEmail: (state) => state.user?.email || "",
    userRole: (state) => state.user?.role || "",
    userCreatedAt: (state) => state.user?.createdAt || "",
    userPermissions: (state) => {
      if (!state.user) return [];

      if (state.user.role === "admin") {
        // ✅ admin gets everything
        return Object.values(PERMISSIONS);
      }

      if (state.user.role === "member") {
        // ✅ member gets view-only, except users
        return [
          PERMISSIONS.CAN_VIEW_DASHBOARD,
          PERMISSIONS.CAN_VIEW_MEALS,
          PERMISSIONS.CAN_VIEW_PAYMENTS,
          PERMISSIONS.CAN_VIEW_REPORTS,
        ];
      }

      return [];
    },
  },

  mutations: {
    AUTH_REQUEST(state) {
      state.loggingIn = true;
    },
    AUTH_SUCCESS(state, payload) {
      state.loggingIn = false;
      state.token = payload.token;
      state.user = payload.user;
    },
    AUTH_FAILED(state) {
      state.loggingIn = false;
    },
    LOGOUT(state) {
      state.token = "";
      state.user = null;
    },
    LOAD_FROM_STORAGE(state) {
      const saved = localStorage.getItem("meal:auth");
      if (saved) {
        const parsed = parse(saved);
        state.token = parsed.token || "";
        state.user = parsed.user || null;
      }
    },
  },

  actions: {
    async logIn({ commit }, credential) {
      console.log("Logging in with credential:", credential);
      commit("AUTH_REQUEST");
      try {
        // 🔥 Send credential to backend
        const result = await apiRequest({
          url: AUTH_URL,
          method: "POST",
          data: { credential }, // send google credential to backend
        });

        // Expect backend to return { token, user }
        const { token, user } = result.data;

        commit("AUTH_SUCCESS", { token, user });

        // Save to localStorage
        localStorage.setItem("meal:auth", stringify({ token, user }));
      } catch (error) {
        commit("AUTH_FAILED");
        throw error;
      }
    },

    logOut({ commit }) {
      commit("LOGOUT");
      localStorage.removeItem("meal:auth");
    },

    loadFromStorage({ commit }) {
      commit("LOAD_FROM_STORAGE");
    },
  },
};
