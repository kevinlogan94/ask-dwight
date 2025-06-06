<template>
  <UModal
    v-model:open="isModalOpen"
    :dismissible="false"
    title="No Internet Connection"
  >
      <template #body>
        <p class="text-center">
          It looks like you're not connected to the internet. Please check your connection and try again.
        </p>

        <UButton label="Retry" class="w-full justify-center mt-5" @click="checkConnection()" />
      </template>
  </UModal>
</template>

<script setup lang="ts">

const supabase = useSupabaseClient();

const isModalOpen = ref(false);

const changeModalStatePerOnlineStatus = async () => {
    if (navigator.onLine) {
      const { error } = await supabase.from("user_prompts").select("*").limit(1);
      isModalOpen.value = !!error;
      return;
    }
    isModalOpen.value = true;
};

const checkConnection = () => {
  window.location.reload();
};

onMounted(async () => {
  await changeModalStatePerOnlineStatus();

  window.addEventListener('online', changeModalStatePerOnlineStatus);
  window.addEventListener('offline', changeModalStatePerOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', changeModalStatePerOnlineStatus);
  window.removeEventListener('offline', changeModalStatePerOnlineStatus);
});
</script>
