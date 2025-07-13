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
              @click="handleRemoveFile(file)"
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
import { useVectorStoreService } from "~/composables/services/useVectorStoreService";
import { useConversationService } from "~/composables/services/useConversationService";

interface UploadedFile {
  id: string;
  filename: string;
  status: "uploading" | "completed";
}

const chatStore = useChatStore();
const toast = useToast();
const { createNewStore, addFile, removeFile } = useVectorStoreService();
const { updateConversation } = useConversationService();
const searchQuery = ref("");
const newVectorStoreId = ref<string | null>(null);
const uploadedFiles = ref<UploadedFile[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const isUploadingFiles = computed(() => {
  return uploadedFiles.value.some((file) => file.status === "uploading");
});

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

const handleRemoveFile = async (file: UploadedFile) => {
  const originalFiles = [...uploadedFiles.value];
  uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== file.id);

  try {
    const vectorStoreId = chatStore.selectedConversation?.vector_store_id ?? newVectorStoreId.value;
    if (!vectorStoreId) {
      throw new Error("Vector store ID is missing.");
    }
    await removeFile(vectorStoreId, file.id);
  } catch (error) {
    console.error("Error removing file:", error);
    uploadedFiles.value = originalFiles;
    toast.add({
      icon: "i-lucide-circle-x",
      title: "Removal Failed",
      description: `Could not remove file '${file.filename}'.`,
      color: "error",
    });
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  let vectorStoreId = chatStore.selectedConversation?.vector_store_id ?? newVectorStoreId.value;

  if (!vectorStoreId) {
    const newStoreId = await createNewStore("Conversation Store");
    if (newStoreId) {
      newVectorStoreId.value = newStoreId;
      vectorStoreId = newStoreId;
    } else {
      console.error("Failed to create a new vector store.");
      toast.add({
        title: "Upload Failed",
        description: "Failed to upload the file. Please try again.",
        color: "error",
        icon: "i-lucide-circle-x",
      });
      return;
    }
  }

  for (const file of Array.from(target.files)) {
    const maxSizeInMB = 25;
    const maxSizeBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      toast.add({
        title: "File Too Large",
        description: `The file '${file.name}' exceeds the ${maxSizeInMB}MB size limit.`,
        color: "error",
        icon: "i-lucide-circle-x",
      });
      continue; // Skip this file
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticFile: UploadedFile = { id: tempId, filename: file.name, status: "uploading" };
    uploadedFiles.value.push(optimisticFile);

    try {
      const uploadedFile = await addFile(vectorStoreId, file);
      if (uploadedFile) {
        const index = uploadedFiles.value.findIndex((f) => f.id === tempId);
        if (index !== -1) {
          const fileToUpdate = uploadedFiles.value[index]!;
          fileToUpdate.id = uploadedFile.id;
          fileToUpdate.status = "completed";
        }
      } else {
        throw new Error("Upload failed to return file details.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== tempId);
      toast.add({
        title: "Error uploading file",
        icon: "i-lucide-circle-x",
        description: `The file '${file.name}' failed to upload. Please try again.`,
        color: "error",
      });
    }
  }

  if (target) {
    target.value = "";
  }
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
    uploadedFiles.value = [];
    newVectorStoreId.value = null;

    useTrackEvent("form_submit_question", {
      event_category: "engagement",
      event_label: "ask_dwight",
      value: searchQuery.value.length, // Track length instead of content for privacy
      non_interaction: false,
    });
  }
};
</script>
