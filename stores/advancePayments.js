import apiRequest from "~/utils/apiRequest";
import { ADVANCE_PAYMENTS_URL } from "~/config/apiEndPoints";
import StepPanel from "primevue/steppanel";

export default {
  namespaced: true,

  state: () => ({
    payments: [],
    page: 1,
    totalPages: 1,
    limit: 15,
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
    ADD_PAYMENT(state, payment) {
      state.payments.unshift(payment); // put at top
    },
    DELETE_PAYMENT(state, paymentId) {
      state.payments = state.payments.filter((p) => p._id !== paymentId);
    },
    UPDATE_PAYMENT(state, updatedPayment) {
      // handle if response is wrapped in { data: ... }
      const paymentData = updatedPayment.data || updatedPayment;

      const index = state.payments.findIndex(
        (p) => String(p._id) === String(paymentData._id)
      );

      if (index !== -1) {
        const existing = state.payments[index];

        state.payments.splice(index, 1, {
          ...existing,
          ...paymentData,
          userId:
            typeof paymentData.userId === "string"
              ? existing.userId // keep populated object if backend only returned ID
              : paymentData.userId, // use populated user if provided
        });
      }
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
    async createPayment({ commit }, payload) {
      commit("SET_LOADING", true);
      try {
        const { data } = await apiRequest({
          url: ADVANCE_PAYMENTS_URL,
          method: "POST",
          data: payload,
        });
        // ✅ directly update state
        commit("ADD_PAYMENT", data.data);
      } catch (err) {
        console.error("❌ Failed to create payment:", err);
        throw err;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async deletePayment({ commit, dispatch, state }, paymentId) {
      commit("SET_LOADING", true);
      try {
        await apiRequest({
          url: `${ADVANCE_PAYMENTS_URL}/${paymentId}`,
          method: "DELETE",
        });

        // ✅ directly remove from state
        commit("DELETE_PAYMENT", paymentId);

        // ✅ If this page is now empty AND not the first page → load previous page
        if (state.page > 1 && state.payments.length === 0) {
          await dispatch("fetchPayments", state.page - 1);
        }
      } catch (err) {
        console.error("❌ Failed to delete payment:", err);
        throw err;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async updatePayment({ commit }, payload) {
      commit("SET_LOADING", true);
      try {
        const { data } = await apiRequest({
          url: `${ADVANCE_PAYMENTS_URL}/${payload._id}`,
          method: "PUT",
          data: payload,
        });

        commit("UPDATE_PAYMENT", data);
      } catch (err) {
        console.error("❌ Failed to update payment:", err);
        throw err;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
