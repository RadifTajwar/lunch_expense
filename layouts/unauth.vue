<template>
  <div class="min-h-screen bg-grey-lighter flex flex-1 flex-col">
    <HeaderNonAuth />
    <slot />
  </div>
</template>

<script setup>
import HeaderNonAuth from "~/components/navigation/HeaderNonAuth";

{
  /* definePageMeta({
  title: `Nucleus - ${route.meta.title}`,
}); */
}
</script>
