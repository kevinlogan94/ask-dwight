<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">Account Details</h1>
    <p>Details for account: {{ $route.params.slug }}</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
// You can fetch account-specific data using the slug from route.params.slug
</script>
