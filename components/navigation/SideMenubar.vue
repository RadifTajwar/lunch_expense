<template>
  <aside
    class="h-screen bg-white shadow-md flex flex-col transition-all duration-300"
    :class="isOpen ? 'w-64' : 'w-20'"
  >
    <!-- Logo + Toggle -->
    <div class="flex items-center justify-between p-4">
      <span v-if="isOpen" class="font-bold text-xl text-primary">
        Lunch Expense
      </span>
      <Button
        icon="pi pi-bars"
        class="p-button-text md:flex hidden"
        @click="$emit('toggle')"
      />
    </div>

    <!-- Menu -->
    <nav class="flex-1 overflow-y-auto">
      <ul class="space-y-2">
        <li v-for="link in filteredLinks" :key="link.path">
          <NuxtLink
            :to="link.path"
            class="flex items-center gap-3 p-3 rounded hover:bg-gray-100 cursor-pointer"
            :class="{ 'justify-center': !isOpen }"
            v-tooltip.right="!isOpen ? link.label : ''"
          >
            <i :class="link.icon"></i>
            <span v-if="isOpen">{{ link.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div
      class="border-t border-b relative rounded cursor-pointer"
      ref="menuWrapper"
    >
      <!-- Avatar -->

      <div
        class="flex w-full items-center p-3 hover:bg-gray-100"
        @click="toggleMenu"
        :class="{ 'justify-center': !isOpen }"
      >
        <div
          class="flex items-center gap-2 cursor-pointer w-10 h-10 justify-center bg-gray-200 rounded-full"
        >
          <span class="font-medium text-gray-700">
            {{ userName ? userName.charAt(0).toUpperCase() : "U" }}
          </span>
        </div>
        <p v-if="isOpen" class="ml-2 font-medium">{{ userName }}</p>
      </div>
      <!-- Dropdown Menu -->
      <div
        v-if="showMenu"
        class="absolute -bottom-[25px] right-0 bg-white shadow-lg rounded-md w-52 z-50 border border-gray-100"
      >
        <button
          @click="handleLogout"
          class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2"
        >
          <i class="pi pi-sign-out"></i> Log Out
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { MENU_LINKS } from "@/constants/menulinks";
import checkUserPermission from "@/utils/check-user-permission";
import { navigateTo } from "nuxt/app";

defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
});

const store = useStore();
const router = useRouter();

const userName = computed(() => store.getters["auth/userName"]);
const showMenu = ref(false);
const menuWrapper = ref(null);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleClickOutside = (event) => {
  if (menuWrapper.value && !menuWrapper.value.contains(event.target)) {
    showMenu.value = false;
  }
};

const handleLogout = async () => {
  await store.dispatch("auth/logOut");
  navigateTo("/");
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const filteredLinks = computed(() =>
  MENU_LINKS.filter((link) => checkUserPermission(link.permission))
);
</script>
