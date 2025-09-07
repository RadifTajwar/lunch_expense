<template>
  <header
    class="fixed top-0 left-0 right-0 h-16 flex items-center justify-between z-50 bg-white border-b border-gray-200 px-4 md:px-12 shadow-sm"
  >
    <!-- Left: Logo -->
    <div class="flex items-center gap-3">
      <Logo />
    </div>
  </header>
</template>

<script>
import Logo from "./Logo";

export default {
  name: "HeaderNonAuth",
  components: {
    Logo,
  },
};
</script>
