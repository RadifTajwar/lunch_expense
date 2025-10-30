<template>
  <div class="flex min-h-screen bg-gray-100 overflow-x-hidden">
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

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-y-auto">
      <HeaderAuth @openSidebar="mobileVisible = true" />
      <main class="flex-1">
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
