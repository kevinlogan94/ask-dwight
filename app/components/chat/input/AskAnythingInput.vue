<template>
  <div>
    <div class="flex justify-end mb-2 mr-1" v-if="!chatStore.showNewConversationScreen">
      <DojoMeter />
    </div>

    <input
      type="file"
      ref="fileInput"
      @change="handleFileUpload"
      class="hidden"
      multiple
      :accept="supportedMimeTypesString"
    />
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
      <template #header v-if="chatStore.chatStatus === 'ready' && uploadedFiles.length > 0">
        <div class="flex flex-row flex-wrap items-center gap-2 p-2">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <UIcon
                v-if="file.status === 'uploading'"
                name="i-lucide-loader-circle"
                class="animate-spin text-neutral-400"
              />
              <UIcon v-else name="i-lucide-file-text" class="text-neutral-400" />
              <span class="font-medium">{{ file.filename }}</span>
            </div>
            <UButton
              icon="i-lucide-x"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="removeUploadedFile(file)"
              :disabled="file.status === 'uploading'"
            />
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
        :disabled="chatStore.throttleSelectedConversation || isUploadingFiles"
        icon="heroicons:arrow-up"
      />
    </UChatPrompt>

    <p v-if="!chatStore.showNewConversationScreen" class="text-xs text-neutral-400 mt-1 text-center">
      Dwight can make mistakes. Double-check his work.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from "~/stores/chat";
import DojoMeter from "~/components/chat/DojoMeter.vue";
import { useConversationService } from "~/composables/services/useConversationService";
import { useFileUpload, supportedMimeTypesString } from "~/composables/useFileUpload";

const chatStore = useChatStore();
const { updateConversation } = useConversationService();
const searchQuery = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const { newVectorStoreId, uploadedFiles, isUploadingFiles, processFiles, removeUploadedFile, resetUploadState } =
  useFileUpload();

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  if (chatStore.chatStatus === "streaming" || chatStore.chatStatus === "submitted") return;
  const target = event.target as HTMLInputElement;
  if (!target.files) return;
  await processFiles(target.files);
};

const handleSubmit = async () => {
  if (
    searchQuery.value.trim() &&
    chatStore.chatStatus !== "streaming" &&
    chatStore.chatStatus !== "submitted" &&
    !chatStore.throttleSelectedConversation
  ) {
    // todo: Remove this later
    // This will take care of existing conversations that don't have a vector_store_id
    if (newVectorStoreId.value && chatStore.selectedConversationId) {
      await updateConversation(chatStore.selectedConversationId, { vector_store_id: newVectorStoreId.value });
    }
    const currentSearchQuery = searchQuery.value;
    searchQuery.value = "";
    chatStore.chatStatus = "submitted";
    await chatStore.sendMessage(currentSearchQuery, newVectorStoreId.value);
    resetUploadState();

    useTrackEvent("form_submit_question", {
      event_category: "engagement",
      event_label: "ask_dwight",
      value: searchQuery.value.length, // Track length instead of content for privacy
      non_interaction: false,
    });
  }
};
</script>
