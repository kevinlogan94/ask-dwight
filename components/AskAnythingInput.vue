<template>
  <div
    class="search-input bg-neutral-800/70 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 border border-neutral-700 shadow-lg"
  >
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Ask anything..."
      class="flex-1 bg-transparent border-none outline-none placeholder:text-neutral-400 text-base"
    />
    <button
      @click="onSubmit(searchQuery); searchQuery = ''"
      class="bg-primary-600 hover:bg-primary-700 rounded-lg p-2 transition-colors duration-200 flex items-center justify-center"
      :disabled="!searchQuery.trim()"
    >
      <Icon name="heroicons:arrow-right" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  onSubmit: {
    type: Function,
    default: undefined
  }
})

const searchQuery = ref("")
</script>

<style scoped>
.search-input {
  transition: all 0.3s ease;
}

.search-input:focus-within {
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5); /* purple-600 with opacity */
}
</style>


