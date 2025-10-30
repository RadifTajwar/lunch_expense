<template>
  <aside
    class="flex flex-col bg-white shadow-md h-screen sticky top-0 border-r border-gray-200 transition-all duration-300"
    :class="isOpen ? 'w-72' : 'w-20'"
  >
    <!-- 🔹 Header -->
    <div
      class="flex items-center justify-between px-5 py-4 border-b border-gray-100"
    >
      <div class="flex items-center gap-2">
        <i
          class="pi pi-utensils text-blue-600 text-2xl"
          v-if="isOpen"
        ></i>
        <span v-if="isOpen" class="font-bold text-lg text-gray-800">
          Lunch Expense
        </span>
      </div>

      <Button
        icon="pi pi-bars"
        class="!p-2 !rounded-md hover:!bg-gray-100 text-gray-600 hidden md:flex"
        @click="$emit('toggle')"
      />
    </div>

    <!-- 🔹 Menu Links -->
    <nav class="flex-1 overflow-y-auto py-4 px-2">
      <ul class="space-y-1">
        <li v-for="link in filteredLinks" :key="link.path">
         <NuxtLink
  :to="link.path"
  class="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
  :class="[
    {
      'justify-center': !isOpen,
      'bg-blue-100 text-blue-700 font-medium':
        $route.path === link.path,
    },
  ]"
  active-class="bg-blue-100 text-blue-700 font-semibold"
  v-tooltip.right="!isOpen ? link.label : ''"
  @click="$emit('toggle')" 
>
  <i :class="link.icon + ' text-lg'"></i>
  <span v-if="isOpen" class="whitespace-nowrap">
    {{ link.label }}
  </span>
</NuxtLink>

        </li>
      </ul>
    </nav>

    <!-- 🔹 User Section -->
    <div
      class="border-t border-gray-100 p-3 relative"
      ref="menuWrapper"
    >
      <!-- Avatar + Name -->
      <div
        class="flex items-center gap-3 cursor-pointer rounded-md p-2 hover:bg-gray-100 transition-colors"
        @click="toggleMenu"
        :class="{ 'justify-center': !isOpen }"
      >
        <div
          class="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 font-semibold rounded-full"
        >
          {{ userName ? userName.charAt(0).toUpperCase() : "U" }}
        </div>

        <div v-if="isOpen" class="flex-1">
          <p class="text-gray-800 font-medium leading-none">
            {{ userName || "User" }}
          </p>
          <p class="text-xs text-gray-500">View menu</p>
        </div>
      </div>

      <!-- Dropdown -->
      <Transition name="fade">
        <div
          v-if="showMenu"
          class="absolute bottom-16 left-3 right-3 bg-white border border-gray-100 rounded-md shadow-lg overflow-hidden z-50"
        >
          <button
            @click="handleLogout"
            class="flex items-center gap-2 w-full text-sm text-red-600 hover:bg-red-50 px-4 py-3 transition-colors"
          >
            <i class="pi pi-sign-out text-red-500"></i>
            <span>Log Out</span>
          </button>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
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
const route = useRoute();

const userName = computed(() => store.getters["auth/userName"]);

const showMenu = ref(false);
const menuWrapper = ref(null);

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function handleClickOutside(e) {
  if (menuWrapper.value && !menuWrapper.value.contains(e.target)) {
    showMenu.value = false;
  }
}

async function handleLogout() {
  await store.dispatch("auth/logOut");
  navigateTo("/");
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside)
);

const filteredLinks = computed(() =>
  MENU_LINKS.filter((link) => checkUserPermission(link.permission))
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
