<template>
  <header
    class="w-full h-16 flex items-center justify-between z-50 bg-white border-b border-grey-light px-4 md:px-12"
  >
    <!-- Left: Logo + Mobile Hamburger -->
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-bars"
        class="md:hidden !p-2 !rounded-md !bg-gray-100 hover:!bg-gray-200 text-gray-700"
        @click="$emit('openSidebar')"
      />
      <Logo />
    </div>

    <!-- Right: User Avatar + Dropdown -->
    <div class="relative" ref="menuWrapper">
      <!-- Avatar -->
      <div
        class="flex items-center gap-3 md:hidden w-10 h-10 justify-center bg-gray-200 rounded-full cursor-pointer"
        @click="toggleMenu"
      >
        <span class="font-medium text-black">
          {{ userName ? userName.charAt(0).toUpperCase() : "U" }}
        </span>
      </div>

      <!-- Dropdown Menu -->
      <div
        v-if="showMenu"
        class="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50"
      >
        <!-- User Info -->
        <div class="px-4 py-3 border-b">
          <p class="text-sm font-medium">
            {{ userName }}
          </p>
          <p class="text-xs text-gray-500">
            {{ userEmail }}
          </p>
        </div>

        <!-- Logout -->
        <button
          @click="handleLogOut"
          class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2"
        >
          <i class="pi pi-sign-out"></i> Log Out
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Logo from "./Logo";
import { navigateTo } from "#app";
export default {
  name: "HeaderNonAuth",
  components: {
    Logo,
  },
  data() {
    return {
      showMenu: false,
    };
  },
  computed: {
    ...mapGetters("auth", ["userName", "userEmail"]),
  },
  methods: {
    ...mapActions("auth", ["logOut"]),
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    handleClickOutside(event) {
      if (
        this.$refs.menuWrapper &&
        !this.$refs.menuWrapper.contains(event.target)
      ) {
        this.showMenu = false;
      }
    },
    handleLogOut() {
      console.log("Logging out user:", this.userName);
      this.logOut();
      navigateTo("/");
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
