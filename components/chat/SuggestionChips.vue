<template>
  <div class="suggestion-chips-container mb-4 mt-2">
    <!-- Suggestions static header with icon -->
    <div class="text-lg dark:text-gray-300 mb-2 flex items-center gap-1">
      <Icon name="heroicons:light-bulb" class="w-3.5 h-3.5 dark:text-gray-400" />
      <span class="font-medium">Continue with:</span>
    </div>

    <!-- Suggestion buttons -->
    <div class="flex gap-2 flex-col">
      <template v-for="(suggestion, index) in suggestions" :key="index">
        <USkeleton v-if="suggestion === 'loading'" class="h-8 w-full rounded dark:bg-success-800/10 bg-success-100" />
        <UButton
          v-else
          size="lg"
          color="success"
          variant="soft"
          class="suggestion-chip bg-success-100 hover:bg-success-200 dark:bg-success-800/10 dark:hover:bg-success-800/20 text-success-800 dark:text-success-300 text-start"
          @click="handleClick(suggestion)"
        >
          {{ suggestion }}
        </UButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  suggestions: string[];
}>();

const emit = defineEmits<{
  select: [suggestion: string];
}>();

function handleClick(suggestion: string) {
  emit("select", suggestion);
}
</script>

<style scoped></style>
