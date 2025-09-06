<template>
  <header
    class="w-full h-16 flex items-center justify-between z-50 bg-white border-b border-grey-light px-4 md:px-12"
  >
    <!-- Left: Logo + Mobile Hamburger -->
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
