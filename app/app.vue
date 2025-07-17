<template>
  <UApp :ui="{ tooltip: true }" :locale="en">
    <div class="bg-gradient-to-b min-h-screen to-gray-300 dark:from-gray-900 dark:to-gray-800 bg-fixed">
      <Navbar />
      <UMain>
        <NuxtRouteAnnouncer />
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UMain>
    </div>
    <NoConnectionModal />
  </UApp>
</template>

<script setup lang="ts">
import { en } from "@nuxt/ui-pro/locale";
import NoConnectionModal from "~/components/NoConnectionModal.vue";
</script>
