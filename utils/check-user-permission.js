import store from "~/stores";

export default function checkUserPermission(permission) {
  const permissions = store.getters["auth/userPermissions"];
  return permissions.includes(permission);
}
