import { ref, computed } from "vue";
import { useChatStore } from "~/stores/chat";
import { useVectorStoreService } from "~/composables/services/useVectorStoreService";

export const supportedMimeTypes = [
  "text/x-c",
  "text/x-c++",
  "text/x-csharp",
  "text/css",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/x-golang",
  "text/html",
  "text/x-java",
  "text/javascript",
  "application/json",
  "text/markdown",
  "application/pdf",
  "text/x-php",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/x-python",
  "text/x-script.python",
  "text/x-ruby",
  "application/x-sh",
  "text/x-tex",
  "application/typescript",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
];

export const supportedMimeTypesString = supportedMimeTypes.join(",");

export interface UploadedFile {
  id: string;
  filename: string;
  status: "uploading" | "completed";
}

const newVectorStoreId = ref<string | null>(null);
const uploadedFiles = ref<UploadedFile[]>([]);

export function useFileUpload() {
  const chatStore = useChatStore();
  const toast = useToast();
  const { createNewStore, addFile, removeFile } = useVectorStoreService();

  const isUploadingFiles = computed(() => {
    return uploadedFiles.value.some((file) => file.status === "uploading");
  });

  const processFiles = async (files: FileList) => {
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

    for (const file of Array.from(files)) {
      const maxSizeInMB = 25;
      const maxSizeBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        toast.add({
          title: "File Too Large",
          description: `The file '${file.name}' exceeds the ${maxSizeInMB}MB size limit.`,
          color: "error",
          icon: "i-lucide-circle-x",
        });
        continue;
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
  };

  const removeUploadedFile = async (file: UploadedFile) => {
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

  const resetUploadState = () => {
    uploadedFiles.value = [];
    newVectorStoreId.value = null;
  };

  return {
    newVectorStoreId,
    uploadedFiles,
    isUploadingFiles,
    processFiles,
    removeUploadedFile,
    resetUploadState,
  };
}
