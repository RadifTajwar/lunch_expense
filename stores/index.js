import { createStore } from "vuex";
import auth from "./auth";
import users from "./users";
import advancePayments from "./advancePayments";
import meals from "./meals";

const store = createStore({
  modules: {
    auth,
    users,
    advancePayments,
    meals,
  },
});

export default store;
