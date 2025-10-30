import apiRequest from "~/utils/apiRequest";
import { MEALS_URL } from "~/config/apiEndPoints";
import { ATTENDANCE_URL } from "~/config/apiEndPoints";
export default {
  namespaced: true,

  state: () => ({
    meals: [],
    page: 1,
    totalPages: 1,
    limit: 10,
    filters: {
      date: "",
      description: "",
      cost: "",
    },
    loading: false,
  }),

  getters: {
    allMeals: (state) => state.meals,
    currentPage: (state) => state.page,
    totalPages: (state) => state.totalPages,
    pageSize: (state) => state.limit,
    filters: (state) => state.filters,
    isLoading: (state) => state.loading,
  },

  mutations: {
    SET_MEALS(state, meals) {
      state.meals = meals;
    },
    SET_PAGE(state, page) {
      state.page = page;
    },
    SET_TOTAL_PAGES(state, total) {
      state.totalPages = total;
    },
    SET_LIMIT(state, limit) {
      state.limit = limit;
    },
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
    SET_LOADING(state, value) {
      state.loading = value;
    },
    ADD_MEAL(state, meal) {
      state.meals.unshift(meal);
    },
    REMOVE_MEAL(state, mealId) {
      state.meals = state.meals.filter((m) => m._id !== mealId);
    },
    UPDATE_MEAL(state, updatedMeal) {
      const meal = updatedMeal.data || updatedMeal;
      const idx = state.meals.findIndex(
        (m) => String(m._id) === String(meal._id)
      );

      if (idx !== -1) {
        state.meals.splice(idx, 1, {
          ...state.meals[idx],
          ...meal,
        });
      }
    },
  },

  actions: {
    async fetchMeals({ commit, state }, newPage = 1) {
      commit("SET_LOADING", true);
      commit("SET_PAGE", newPage);

      const params = {
        page: state.page,
        limit: state.limit,
      };

      if (state.filters.date) params.date = state.filters.date;
      if (state.filters.description)
        params.description = state.filters.description;
      if (state.filters.cost) params.cost = state.filters.cost;

      const query = new URLSearchParams(params).toString();
      try {
        const res = await apiRequest({
          url: `${MEALS_URL}?${query}`,
          method: "GET",
        });

        commit("SET_MEALS", res.data.data || []);
        commit("SET_TOTAL_PAGES", res.data.pages || 1);
      } catch (err) {
        console.error("❌ Failed to fetch meals:", err);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async createMeal({ commit }, payload) {
      commit("SET_LOADING", true);
      try {
        const res = await apiRequest({
          url: MEALS_URL,
          method: "POST",
          data: payload,
        });
        commit("ADD_MEAL", res.data.data || res.data);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateMeal({ commit }, payload) {
      commit("SET_LOADING", true);
      try {
        const { data } = await apiRequest({
          url: `${MEALS_URL}/${payload._id}`,
          method: "PUT",
          data: payload,
        });
        commit("UPDATE_MEAL", data);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async saveAttendances({ commit }, { mealId, updates }) {
      try {
        const res = await apiRequest({
          url: `${ATTENDANCE_URL}/${mealId}`, // e.g., new endpoint
          method: "PUT", // or PUT depending on your design
          data: updates,
        });
        commit("UPDATE_MEAL", res.data); // server returns updated meal with attendees
      } catch (err) {
        console.error("❌ Failed to save attendances:", err);
      }
    },

    async deleteMeal({ commit, dispatch, state }, mealId) {
      commit("SET_LOADING", true);
      try {
        await apiRequest({
          url: `${MEALS_URL}/${mealId}`,
          method: "DELETE",
        });

        commit("REMOVE_MEAL", mealId);

        if (state.page > 1 && state.meals.length === 0) {
          await dispatch("fetchMeals", state.page - 1);
        }
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
