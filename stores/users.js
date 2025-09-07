import apiRequest from "~/utils/apiRequest";
import { USERS_URL } from "~/config/apiEndPoints";

export default {
  namespaced: true,

  state: () => ({
    users: [],
    loading: false,
  }),

  getters: {
    allUsers: (state) => state.users,
    isLoading: (state) => state.loading,
    getUserById: (state) => (id) => state.users.find((u) => u._id === id),
  },

  mutations: {
    SET_LOADING(state, value) {
      state.loading = value;
    },
    SET_USERS(state, users) {
      state.users = users;
    },
    ADD_USER(state, user) {
      state.users.push(user);
    },
    REMOVE_USER(state, userId) {
      state.users = state.users.filter((u) => u._id !== userId);
    },
    UPDATE_USER(state, updatedUser) {
      const idx = state.users.findIndex((u) => u._id === updatedUser._id);
      if (idx !== -1) state.users[idx] = updatedUser;
    },
  },

  actions: {
    async fetchUsers({ commit }) {
      commit("SET_LOADING", true);
      const res = await apiRequest({
        url: USERS_URL,
        method: "GET",
      });
      commit("SET_USERS", res.data.users);
      commit("SET_LOADING", false);
    },

    async createUser({ commit, dispatch }, payload) {
      commit("SET_LOADING", true);
      try {
        await apiRequest({
          url: USERS_URL,
          method: "POST",
          data: payload,
        });
        await dispatch("fetchUsers");
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deleteUser({ commit, dispatch }, userId) {
      commit("SET_LOADING", true);
      try {
        await apiRequest({
          url: `${USERS_URL}/${userId}`,
          method: "DELETE",
        });
        await dispatch("fetchUsers");
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
