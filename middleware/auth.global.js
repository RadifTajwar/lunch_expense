import { useStore } from "vuex";
import { MENU_LINKS } from "~/constants/menulinks";
import checkUserPermission from "~/utils/check-user-permission";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return;

  const store = useStore();

  const authRequired = to.matched.some((route) => route.meta?.authRequired);
  const isLoggedIn = store.getters["auth/isLoggedIn"];

  // 🚫 If route needs auth but user not logged in → go home
  if (authRequired && !isLoggedIn) {
    return navigateTo({
      path: "/",
      query: {
        redirectFrom: to.path,
      },
      replace: true,
    });
  }

  // 🔄 Handle redirect after login
  if (authRequired && isLoggedIn && from.query.redirectFrom) {
    const redirectFrom = from.query.redirectFrom;
    delete from.query.redirectFrom;
    return navigateTo({ path: redirectFrom });
  }

  // 🏠 If user is logged in and tries to go to "/", redirect to first permitted page
  if (to.path === "/" && isLoggedIn) {
    const permittedPaths = [];

    MENU_LINKS.forEach((link) => {
      if (
        checkUserPermission(link.permission, store.getters["auth/userRole"])
      ) {
        permittedPaths.push(link.path);
      }
    });

    if (permittedPaths.length > 0) {
      return navigateTo({ path: permittedPaths[0] });
    }
  }
});
