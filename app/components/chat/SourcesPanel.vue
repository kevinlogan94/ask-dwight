<template>
  <USlideover v-model:open="chatStore.isSourcesPanelOpen" title="Sources" description="Dwight used the following documents to generate this response">
    <template #body>
      <div class="flex-1 space-y-6">
        <!-- Documents Section -->
        <div v-if="documentSources.length > 0" class="space-y-2">
          <p class="text-sm font-medium text-gray-900 dark:text-white">Documents</p>
          <ul class="space-y-2">
            <li v-for="(source, index) in documentSources" :key="index">
              <UButton
                color="neutral"
                variant="outline"
                class="text-left w-full p-4 text-md"
                icon="i-lucide-file-text"
              >
                <span class="truncate">{{ source.title }}</span>
              </UButton>
            </li>
          </ul>
        </div>

        <!-- Web Sources Section -->
        <div v-if="webSources.length > 0" class="space-y-2">
          <p class="text-sm font-medium text-gray-900 dark:text-white">Web Sources</p>
          <ul class="space-y-2">
            <li v-for="(source, index) in webSources" :key="index">
              <UButton
                color="neutral"
                variant="outline"
                class="text-left w-full p-4 text-md"
                icon="i-lucide-link"
              >
                <span class="truncate">{{ source.title }}</span>
              </UButton>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useChatStore } from "~/stores/chat";

const chatStore = useChatStore();

const activeSources = computed(() => chatStore.activeSources);

const documentSources = computed(() =>
  activeSources.value.filter((s) => s.type === "file")
);

const webSources = computed(() =>
  activeSources.value.filter((s) => s.type === "web")
);
</script>
