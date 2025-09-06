// constants/menulinks.js
import { PERMISSIONS } from "./permissions";

export const MENU_LINKS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "pi pi-chart-bar",
    parentPath: "/",
    permission: PERMISSIONS.CAN_VIEW_DASHBOARD,
  },
  {
    label: "Meals",
    path: "/meals",
    icon: "pi pi-prime",
    parentPath: "/",
    permission: PERMISSIONS.CAN_VIEW_MEALS, // 👈 only needs view
  },
  {
    label: "Advance Payments",
    path: "/advance-payments",
    icon: "pi pi-wallet",
    parentPath: "/",
    permission: PERMISSIONS.CAN_VIEW_PAYMENTS,
  },
  {
    label: "Users",
    path: "/users",
    icon: "pi pi-users",
    parentPath: "/",
    permission: PERMISSIONS.CAN_VIEW_USERS, // 👈 members won't get this
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "pi pi-file-excel",
    parentPath: "/",
    permission: PERMISSIONS.CAN_VIEW_REPORTS,
  },
];
