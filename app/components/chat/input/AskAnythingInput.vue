<template>
  <div>
    <div class="flex justify-end mb-2 mr-1" v-if="!chatStore.showNewConversationScreen">
      <DojoMeter />
    </div>

    <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" multiple />
    <UChatPrompt
      variant="outline"
      :disabled="chatStore.throttleSelectedConversation"
      placeholder="Ask anything..."
      :loading="chatStore.chatStatus === 'streaming' || chatStore.chatStatus === 'submitted'"
      v-model="searchQuery"
      @submit="handleSubmit"
      autofocus
      class="p-3 focus-within:ring-1 focus-within:ring-primary-500/30"
    >
        <!-- Uploaded File Display -->
      <template #header v-if="uploadedFiles.length > 0">
        <div class="flex flex-row flex-wrap items-center gap-2 p-2">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="text-neutral-400" />
              <span class="font-medium">{{ file.name }}</span>
            </div>
            <UButton icon="i-lucide-x" size="xs" color="neutral" variant="ghost" @click="removeFile(index)" />
          </div>
        </div>
      </template>

      <template #footer>
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="ghost"
          :disabled="chatStore.throttleSelectedConversation"
          @click.prevent="triggerFileInput"
          label="Add Files"
        />
      </template>

      <UChatPromptSubmit
        v-if="chatStore.chatStatus === 'ready'"
        color="success"
        variant="solid"
        :disabled="chatStore.throttleSelectedConversation"
        icon="heroicons:arrow-up"
      />
    </UChatPrompt>

    <p v-if="!chatStore.showNewConversationScreen" class="text-xs text-neutral-400 mt-1 text-center">
      Dwight can make mistakes. Double-check his work.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from "~//stores/chat";
import DojoMeter from "~/components/chat/DojoMeter.vue";

const chatStore = useChatStore();
const searchQuery = ref("");
const uploadedFiles = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    uploadedFiles.value.push(...Array.from(target.files));
  }
  // Reset the input value to allow selecting the same file again
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
};

const handleSubmit = () => {
  // TODO: Handle file submission along with the message
  if (searchQuery.value.trim() && chatStore.chatStatus !== 'streaming' && chatStore.chatStatus !== 'submitted' && !chatStore.throttleSelectedConversation) {
    chatStore.sendMessage(searchQuery.value);
    searchQuery.value = "";

    useTrackEvent("form_submit_question", {
      event_category: "engagement",
      event_label: "ask_dwight",
      value: searchQuery.value.length, // Track length instead of content for privacy
      non_interaction: false,
    });
  }
};
</script>
