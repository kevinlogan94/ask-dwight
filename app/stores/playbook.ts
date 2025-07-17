import { defineStore } from "pinia";
import type { File } from "~/models/generic";
import { useProfileRepository } from "~/composables/repositories/useProfileRepository";
import { useVectorStoreService } from "~/composables/services/useVectorStoreService";

export const usePlaybookStore = defineStore("playbook", () => {
  const user = useSupabaseUser();

  // State
  const files = ref<File[]>([]);
  const globalVectorStoreId = ref<string | null>(null);

  // Dependencies
  const { getProfile, createProfile } = useProfileRepository();
  const { fetchFiles, addFile, removeFile, createNewStore } = useVectorStoreService();

  // Actions
  async function fetchPlaybookFiles() {
    if (!globalVectorStoreId.value) {
      console.warn("No global vector store ID set. Cannot fetch playbook files.");
      return;
    }
    try {
      files.value = await fetchFiles(globalVectorStoreId.value);
    } catch (error) {
      console.error("Error fetching playbook files:", error);
    }
  }

  async function addFileToPlaybook(file: globalThis.File) {
    try {
      // If the playbook doesn't exist yet, create it on the fly.
      if (!globalVectorStoreId.value) {
        await createPlaybook();
      }

      // After creation, the ID should be available. If not, something went wrong.
      if (!globalVectorStoreId.value) {
        throw new Error("Playbook doesn't exist. Cannot add file.");
      }

      // Now, proceed with adding the file.
      await addFile(globalVectorStoreId.value, file);
      await fetchPlaybookFiles(); // Refresh the list after adding.
    } catch (error) {
      console.error("Error adding file to playbook:", error);
    }
  }

  async function removeFileFromPlaybook(fileId: string) {
    if (!globalVectorStoreId.value) {
      console.error("Cannot remove file without a global vector store ID.");
      return;
    }
    try {
      await removeFile(globalVectorStoreId.value, fileId);
      // Optimistically remove from UI or refetch
      files.value = files.value.filter((f) => f.id !== fileId);
    } catch (error) {
      console.error("Error removing file from playbook:", error);
    }
  }

  async function createPlaybook() {
    if (!user.value) {
      console.error("User must be logged in to create a playbook.");
      return;
    }

    try {
      // 1. Create a new vector store
      const newStoreId = await createNewStore(`Playbook for User with Id: ${user.value.id}`);
      if (!newStoreId) {
        throw new Error("Failed to create a new vector store.");
      }

      // 2. Create the profile entry with the new vector store ID
      const newProfile = await createProfile({
        user_id: user.value.id, // Foreign key to auth.users
        vector_store_id: newStoreId,
      });

      if (!newProfile) {
        throw new Error("Failed to create user profile.");
      }

      // 3. Update the local state
      globalVectorStoreId.value = newStoreId;
      files.value = []; // New playbook is empty
    } catch (error) {
      console.error("Error creating playbook:", error);
    }
  }

  // Load initial data
  onMounted(async () => {
    const profile = await getProfile();
    if (profile && profile.vector_store_id) {
      globalVectorStoreId.value = profile.vector_store_id;
      await fetchPlaybookFiles();
    }
  });

  return {
    // State
    files,
    globalVectorStoreId,

    // Actions
    addFileToPlaybook,
    removeFileFromPlaybook,
  };
});
