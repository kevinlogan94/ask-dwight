<template>
  <USlideover v-model="isSourcesPanelOpen" title="Sources" description="Dwight used the following documents to generate this response">
    <UCard class="flex flex-col flex-1">
      <div class="p-4 flex-1 space-y-6">
        <!-- Documents Section -->
        <div v-if="documentSources.length > 0" class="space-y-2">
          <p class="text-sm font-medium text-gray-900 dark:text-white">Documents</p>
          <ul class="space-y-2">
            <li v-for="(source, index) in documentSources" :key="index">
              <UButton
                color="neutral"
                variant="outline"
                block
                class="text-left"
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
                block
                class="text-left"
                icon="i-lucide-link"
              >
                <span class="truncate">{{ source.title }}</span>
              </UButton>
            </li>
          </ul>
        </div>
      </div>
    </UCard>
  </USlideover>
</template>

<script setup lang="ts">
import { useChatStore } from "~/stores/chat";

const chatStore = useChatStore();

const isSourcesPanelOpen = computed({
  get: () => chatStore.isSourcesPanelOpen,
  set: (value) => {
    if (!value) {
      chatStore.closeSourcesPanel();
    }
  },
});

const activeSources = computed(() => chatStore.activeSources);

const documentSources = computed(() =>
  activeSources.value.filter((s) => s.type === "file")
);

const webSources = computed(() =>
  activeSources.value.filter((s) => s.type === "web")
);
</script>
