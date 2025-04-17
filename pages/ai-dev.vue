<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-center bg-radial-at-center from-purple-950 to-slate-900"
  >
    <div class="mb-10">
      <h1 class="text-6xl font-bold text-center">Ask Dwight</h1>
    </div>

    <div class="w-full max-w-xl mx-auto">
      <!-- Search Input Component -->
      <AskAnythingInput :onSubmit="submitSearch" />

      <!-- Sample quick links/suggestions -->
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <UButton
          v-for="(suggestion, index) in suggestions"
          :key="index"
          variant="ghost"
          color="primary"
          size="sm"
          class="border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700/80 text-white"
          @click="
            searchQuery = suggestion;
            submitSearch();
          "
        >
          <div class="flex items-center gap-2">
            <Icon :name="suggestionIcons[index % suggestionIcons.length]" class="w-4 h-4" />
            <span>{{ suggestion }}</span>
          </div>
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref("");

const suggestions = [
  "Top 10 Thai restaurants in SF",
  "AMD Milan vs Genoa CPUs",
  "Best croissant in Paris",
  "DeepSeek and the stock market",
];

const suggestionIcons = ["heroicons:document-text", "heroicons:cpu-chip", "heroicons:sparkles", "heroicons:chart-bar"];

const submitSearch = () => {
  if (!searchQuery.value.trim()) return;

  // Handle search submission here
  console.log("Search submitted:", searchQuery.value);

  // For demo purposes - you can replace this with actual search handling
  // searchQuery.value = ''
};
</script>

<style scoped>
.search-input {
  transition: all 0.3s ease;
}

.search-input:focus-within {
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5); /* purple-600 with opacity */
}
</style>
