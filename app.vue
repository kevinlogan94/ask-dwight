<template>
  <UApp :ui="{ tooltip: true }">
    <div class="bg-gradient-to-b min-h-screen to-gray-400 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <UMain>
        <NuxtRouteAnnouncer />
        <NuxtPage />
      </UMain>
    </div>
  </UApp>
</template>

<script setup lang="ts"></script>
