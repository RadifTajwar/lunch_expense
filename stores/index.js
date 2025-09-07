import { createStore } from "vuex";
import auth from "./auth";
import users from "./users";
import advancePayments from "./advancePayments";
const store = createStore({
  modules: {
    auth,
    users,
    advancePayments,
  },
});

export default store;
