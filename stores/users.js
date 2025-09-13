// stores/users.js
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
      state.users.unshift(user.user); // add on top
    },
    REMOVE_USER(state, userId) {
      state.users = state.users.filter((u) => u._id !== userId);
    },
    UPDATE_USER(state, updatedUser) {
      const user = updatedUser.user || updatedUser; // normalize

      const idx = state.users.findIndex(
        (u) => String(u._id) === String(user._id)
      );

      if (idx !== -1) {
        state.users.splice(idx, 1, {
          ...state.users[idx],
          ...user,
        });
      }
    },
  },

  actions: {
    async fetchUsers({ commit }, filters = {}) {
  commit("SET_LOADING", true);
  try {
    // 🔹 Convert filters object to query string
    const query = new URLSearchParams(filters).toString();

    const res = await apiRequest({
      url: `${USERS_URL}${query ? `?${query}` : ""}`,
      method: "GET",
    });

    commit("SET_USERS", res.data.users || []);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
  } finally {
    commit("SET_LOADING", false);
  }
}
,

    async createUser({ commit }, payload) {
      commit("SET_LOADING", true);
      try {
        const res = await apiRequest({
          url: USERS_URL,
          method: "POST",
          data: payload,
        });
        commit("ADD_USER", res.data);
      } catch (err) {
        console.error("❌ Failed to create user:", err);
        throw err;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deleteUser({ commit }, userId) {
      commit("SET_LOADING", true);
      try {
        await apiRequest({
          url: `${USERS_URL}/${userId}`,
          method: "DELETE",
        });
        commit("REMOVE_USER", userId);
      } catch (err) {
        console.error("❌ Failed to delete user:", err);
        throw err;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateUser({ commit }, payload) {
      commit("SET_LOADING", true);
      console.log("payload is ",payload);
      try {
        const { data } = await apiRequest({
          url: `${USERS_URL}/${payload._id}`,
          method: "PUT",
          data: payload,
        });
        commit("UPDATE_USER", data);
      } catch (err) {
        console.error("❌ Failed to update user:", err);
        throw err;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
