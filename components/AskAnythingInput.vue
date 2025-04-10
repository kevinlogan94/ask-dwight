<template>
  <form
    class="search-input bg-neutral-800/70 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 border border-neutral-700 shadow-lg"
    @submit.prevent="handleSubmit"
  >
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Ask anything..."
      autofocus
      class="flex-1 bg-transparent border-none outline-none placeholder:text-neutral-400 text-base"
    />
    <UButton
      type="submit"
      color="success"
      variant="solid"
      :disabled="!searchQuery.trim() || chatStore.aiResponsePending"
      icon="heroicons:arrow-right"
      :loading="chatStore.aiResponsePending"
      class="h-8"
    />
  </form>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore();

const props = defineProps({
  onSubmit: {
    type: Function,
    default: undefined
  }
})

const searchQuery = ref("")

const handleSubmit = () => {
  if (searchQuery.value.trim() && props.onSubmit) {
    props.onSubmit(searchQuery.value)
    searchQuery.value = ''
  }
}
</script>

<style scoped>
.search-input {
  transition: all 0.3s ease;
}

.search-input:focus-within {
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
}
</style>
