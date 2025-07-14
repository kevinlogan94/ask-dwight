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
      :accept="supportedMimeTypes"
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
      <template #header v-if="uploadedFiles.length > 0">
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
import { useFileUpload } from "~/composables/useFileUpload";

const chatStore = useChatStore();
const { updateConversation } = useConversationService();
const searchQuery = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const {
  newVectorStoreId,
  uploadedFiles,
  isUploadingFiles,
  processFiles,
  removeUploadedFile,
  resetUploadState,
} = useFileUpload();

const supportedFileTypes = [
  { ext: ".c", mime: "text/x-c" },
  { ext: ".cpp", mime: "text/x-c++" },
  { ext: ".cs", mime: "text/x-csharp" },
  { ext: ".css", mime: "text/css" },
  { ext: ".doc", mime: "application/msword" },
  { ext: ".docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { ext: ".go", mime: "text/x-golang" },
  { ext: ".html", mime: "text/html" },
  { ext: ".java", mime: "text/x-java" },
  { ext: ".js", mime: "text/javascript" },
  { ext: ".json", mime: "application/json" },
  { ext: ".md", mime: "text/markdown" },
  { ext: ".pdf", mime: "application/pdf" },
  { ext: ".php", mime: "text/x-php" },
  { ext: ".pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  { ext: ".py", mime: ["text/x-python", "text/x-script.python"] },
  { ext: ".rb", mime: "text/x-ruby" },
  { ext: ".sh", mime: "application/x-sh" },
  { ext: ".tex", mime: "text/x-tex" },
  { ext: ".ts", mime: "application/typescript" },
  { ext: ".txt", mime: "text/plain" },
];

const supportedMimeTypes = computed(() => {
  return supportedFileTypes.flatMap((t) => t.mime).join(",");
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
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

    await chatStore.sendMessage(searchQuery.value, newVectorStoreId.value);
    searchQuery.value = "";
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
