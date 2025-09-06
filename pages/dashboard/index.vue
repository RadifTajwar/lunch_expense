<template>
  <div class="a">
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    <i class="pi pi-utensils">dfsdf</i>
  </div>
</template>

<script setup>
defineOptions({
  name: "DashboardPage",
});

definePageMeta({
  layout: "default",
  authRequired: true,
  title: "Dashboard",
});
</script>
