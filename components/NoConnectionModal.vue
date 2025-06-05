<template>
  <UModal
    v-model:open="isModalOpen"
    :dismissible="false"
    title="No Internet Connection"
  >
    <UCard>
      <template #body>
        <p class="text-center">
          It looks like you're not connected to the internet. Please check your connection and try again.
        </p>

        <UButton label="Retry Connection" class="w-full justify-center mt-5" @click="checkConnection()" />
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">

const isModalOpen = ref(false);

const changeModalStatePerOnlineStatus = () => {
  if (typeof navigator !== 'undefined') {
   isModalOpen.value = !navigator.onLine;
  }
};

const checkConnection = () => {
  changeModalStatePerOnlineStatus();
};

onMounted(() => {
  changeModalStatePerOnlineStatus();

  if (typeof window !== 'undefined') {
    window.addEventListener('online', changeModalStatePerOnlineStatus);
    window.addEventListener('offline', changeModalStatePerOnlineStatus);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', changeModalStatePerOnlineStatus);
    window.removeEventListener('offline', changeModalStatePerOnlineStatus);
  }
});
</script>
