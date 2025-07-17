<template>
  <div class="pt-10">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Playbook</h1>
      <p class="mt-2 text-lg text-gray-500 dark:text-gray-400">
        Upload your general sales documents. Dwight will use this playbook as a knowledge base for all conversations.
      </p>

      <div class="mt-8 space-y-8">
        <!-- Upload Card -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Upload to your playbook</h2>
          </template>

          <div class="space-y-4">
            <div>
              <label for="file-upload" class="sr-only">Choose file</label>
              <div class="flex items-center">
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  class="hidden"
                  @change="onFileChange"
                  accept=".pdf,.docx,.txt"
                  :disabled="loading"
                />
                <UButton variant="outline" @click="openFilePicker" :disabled="loading"> Choose File </UButton>
                <span class="ml-3 text-sm text-gray-500 dark:text-gray-400 truncate">{{ selectedFileName }}</span>
              </div>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Accepted formats: PDF, DOCX, TXT.</p>
            </div>

            <UButton
              icon="i-lucide-upload-cloud"
              size="lg"
              block
              :disabled="!selectedFile"
              :loading="loading"
              @click="AddFile"
            >
              Teach Dwight
            </UButton>
          </div>
        </UCard>

        <!-- Your Playbook Card -->
        <UCard v-if="playbookStore.files.length > 0">
          <template #header>
            <div>
              <h2 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Your Playbook</h2>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload your own sales playbook or materials here to personalize Dwight's responses to your style.
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-for="file in playbookStore.files"
              :key="file.id"
              class="flex items-center justify-between p-3 -m-3 transition duration-150 ease-in-out border border-gray-200 rounded-lg dark:border-gray-700"
            >
              <div class="flex items-center">
                <UIcon name="i-lucide-file-text" class="w-6 h-6 text-primary-500 dark:text-primary-400" />
                <p class="ml-4 text-sm font-medium text-gray-900 dark:text-white">
                  {{ file.name }}
                </p>
              </div>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                :loading="removingFileId === file.id"
                @click="removeFile(file.id)"
              />
            </div>
          </div>
        </UCard>

        <!-- Official Material Card -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Official Material</h2>
              <UTooltip
                text="This is Dwight’s default sales playbook — proven templates, objection handlers, and strategies built in for everyone."
                :delayDuration="50"
                :ui="{ text: 'text-lg' }"
              >
                <UIcon name="i-lucide-info" />
              </UTooltip>
            </div>
          </template>

          <div
            class="flex items-center p-3 -m-3 transition duration-150 ease-in-out border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
          >
            <UIcon name="i-lucide-file-text" class="w-6 h-6 text-primary-500 dark:text-primary-400" />
            <p class="ml-4 text-sm font-medium text-gray-900 dark:text-white">Official Dwight Playbook</p>
          </div>
        </UCard>

        <!-- Examples Card -->
        <UCard>
          <template #header>
            <div class="flex items-center">
              <UIcon name="i-lucide-list-checks" class="w-6 h-6 text-primary-500 dark:text-primary-400" />
              <h2 class="ml-2 text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                Examples of what you can upload:
              </h2>
            </div>
          </template>

          <ul class="pl-5 space-y-2 list-disc">
            <li class="text-gray-700 dark:text-gray-300">Cold Email Template</li>
            <li class="text-gray-700 dark:text-gray-300">Discovery Call Script</li>
            <li class="text-gray-700 dark:text-gray-300">Product One-Pager</li>
            <li class="text-gray-700 dark:text-gray-300">Objection Handling Sheet</li>
          </ul>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlaybookStore } from "~/stores/playbook";

definePageMeta({ showSidebar: true });

const playbookStore = usePlaybookStore();
const toast = useToast();

const selectedFile = ref<File | null>(null);
const selectedFileName = ref("No file chosen");
const loading = ref(false);
const removingFileId = ref<string | null>(null);

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
    selectedFileName.value = file.name;
  } else {
    selectedFile.value = null;
    selectedFileName.value = "No file chosen";
  }
};

const openFilePicker = () => {
  document.getElementById("file-upload")?.click();
};

const AddFile = async () => {
  if (!selectedFile.value) return;

  loading.value = true;
  try {
    await playbookStore.addFileToPlaybook(selectedFile.value);
    selectedFile.value = null;
    selectedFileName.value = "No file chosen";
    toast.add({
      title: "Playbook Updated",
      icon: "i-lucide-circle-check",
      description: "Your file has been successfully uploaded.",
      color: "primary",
    });
  } catch (error) {
    console.error("Failed to upload playbook file:", error);
    toast.add({
      title: "Upload Failed",
      icon: "i-lucide-circle-x",
      description: "There was an error uploading your file. Please try again.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const removeFile = async (fileId: string) => {
  removingFileId.value = fileId;
  try {
    await playbookStore.removeFileFromPlaybook(fileId);
    toast.add({
      title: "File Removed",
      icon: "i-lucide-circle-check",
      description: "The file has been successfully removed from your playbook.",
      color: "primary",
    });
  } catch (error) {
    console.error("Failed to remove playbook file:", error);
    toast.add({
      title: "Removal Failed",
      icon: "i-lucide-circle-x",
      description: "There was an error removing the file. Please try again.",
      color: "error",
    });
  } finally {
    removingFileId.value = null;
  }
};
</script>
