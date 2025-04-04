<template>
  <UApp :ui="{ tooltip: true }">
    <div class="bg-gradient-to-b from-gray-50 to-gray-300 dark:from-gray-900 dark:to-gray-800">
    <Navbar />
    <NuxtRouteAnnouncer />
    <NuxtPage />  
  </div>
  </UApp>
</template>

<script setup lang="ts">
</script>