<template>
  <nav class="fixed w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <NuxtLink to="/" class="flex items-center">
            <img src="/favicon.ico" alt="Ask Dwight Logo" class="h-8 w-auto" />
            <span class="ml-3 font-bold text-xl text-gray-900 dark:text-white">Ask Dwight</span>
          </NuxtLink>
        </div>
        
        <div class="flex items-center">
          <ColorModeButton />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
// Basic Navbar component using Nuxt and Tailwind CSS
</script>
