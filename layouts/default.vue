<template>
  <div class="flex min-h-screen bg-gray-100 overflow-hidden">
    <!-- Desktop Sidebar -->
    <SideMenubar
      v-if="!isMobile"
      :isOpen="isOpen"
      @toggle="isOpen = !isOpen"
      class="hidden md:block"
    />

    <!-- Mobile Sidebar -->
    <ClientOnly>
      <Sidebar
        v-model:visible="mobileVisible"
        position="left"
        appendTo="body"
        :baseZIndex="2000"
        modal
        class="md:hidden"
      >
        <SideMenubar :isOpen="true" @toggle="mobileVisible = false" />
      </Sidebar>
    </ClientOnly>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-y-auto">
      <!-- ✅ Fixed Header -->
      <HeaderAuth @openSidebar="mobileVisible = true" />

      <!-- ✅ Add top padding to avoid overlap -->
      <main
  class="flex-1 pt-16 transition-all duration-300"
  :class="[isOpen ? 'md:ml-72' : 'md:ml-20']"
>
  <slot />
</main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import HeaderAuth from "~/components/navigation/HeaderAuth.vue";
import SideMenubar from "~/components/navigation/SideMenubar.vue";

const isOpen = ref(true);
const mobileVisible = ref(false);
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

<style scoped>
/* Optional: ensures layout fills full height properly */
html,
body,
#__nuxt {
  height: 100%;
}
</style>
