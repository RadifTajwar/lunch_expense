import apiRequest from "~/utils/apiRequest";
import { ADVANCE_PAYMENTS_URL } from "~/config/apiEndPoints";

export default {
  namespaced: true,

  state: () => ({
    payments: [],
    page: 1,
    totalPages: 1,
    limit: 5,
    filters: {
      // 🔹 MUST be initialized
      name: "",
      email: "",
    },
    loading: false,
  }),

  getters: {
    allPayments: (state) => state.payments,
    currentPage: (state) => state.page,
    totalPages: (state) => state.totalPages,
    pageSize: (state) => state.limit,
    filters: (state) => state.filters, // 🔹 Expose filters
    isLoading: (state) => state.loading,
  },

  mutations: {
    SET_PAYMENTS(state, payload) {
      state.payments = payload;
    },
    SET_PAGE(state, payload) {
      state.page = payload;
    },
    SET_TOTAL_PAGES(state, payload) {
      state.totalPages = payload;
    },
    SET_LIMIT(state, payload) {
      state.limit = payload;
    },
    SET_FILTERS(state, payload) {
      state.filters = { ...state.filters, ...payload }; // 🔹 Merge updates
    },
    SET_LOADING(state, value) {
      state.loading = value;
    },
  },

  actions: {
    async fetchPayments({ commit, state }, newPage = 1) {
      commit("SET_LOADING", true);
      commit("SET_PAGE", newPage);

      const query = new URLSearchParams({
        page: state.page,
        limit: state.limit,
        name: state.filters.name,
        email: state.filters.email,
      }).toString();

      try {
        const res = await apiRequest({
          url: `${ADVANCE_PAYMENTS_URL}?${query}`,
          method: "GET",
        });

        commit("SET_PAYMENTS", res.data.data || []);
        commit("SET_TOTAL_PAGES", res.data.pages || 1);
      } catch (err) {
        console.error("❌ Failed to fetch payments:", err);
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async createPayment({ commit, dispatch }, payload) {
      commit("SET_LOADING", true); // 🔹 turn on loader
      try {
        await apiRequest({
          url: ADVANCE_PAYMENTS_URL,
          method: "POST",
          data: payload,
        });

        await dispatch("fetchPayments", 1); // reload after success
      } catch (err) {
        console.error("❌ Failed to create payment:", err);
        throw err; // so Toast can catch it in UI
      } finally {
        commit("SET_LOADING", false); // 🔹 turn off loader
      }
    },
  },
};
