<template>
  <div class="flex">
    <!-- Conditionally render the sidebar based on the route's meta field -->
    <AppSidebar v-if="showSidebar" />
    <div
      class="w-full transition-all duration-300"
      :class="{
        'lg:ml-64': showSidebar && chatStore.sidebarOpen,
        'pt-24': applyPT && isBannerVisible,
        'pt-16': applyPT && !isBannerVisible
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import AppSidebar from "~/components/layout/AppSidebar.vue";
import { useChatStore } from "~/stores/chat";
import { useBanner } from '~/composables/useBanner';

const chatStore = useChatStore();
const route = useRoute();
const { isBannerVisible } = useBanner();

// Show the sidebar by default, unless the route meta field is explicitly set to false.
const showSidebar = computed(() => route.meta.showSidebar !== false);

// we don't want the padding-top when the user is on the home route and the new conversation screen is visible. Otherwise, we need it to avoid the navbar.
const applyPT = computed(() => !(route.path === "/" && chatStore.showNewConversationScreen) && !route.path.startsWith("/auth"));
</script>
