<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Desktop Sidebar -->
    <SideMenubar
      v-if="!isMobile"
      :isOpen="isOpen"
      @toggle="isOpen = !isOpen"
      class="hidden md:block"
    />

    <!-- Mobile Sidebar -->
    <Sidebar
      v-model:visible="mobileVisible"
      position="left"
      class="md:hidden w-64"
    >
      <SideMenubar :isOpen="true" @toggle="mobileVisible = false" />
    </Sidebar>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <HeaderAuth @openSidebar="mobileVisible = true" />
      <main class="p-6 flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import HeaderAuth from "~/components/navigation/HeaderAuth";
import SideMenubar from "~/components/navigation/SideMenubar";

const isOpen = ref(true); // desktop collapse state
const mobileVisible = ref(false); // mobile sidebar
const isMobile = ref(false);

function checkScreen() {
  isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
  checkScreen();
  window.addEventListener("resize", checkScreen);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreen);
});
</script>
