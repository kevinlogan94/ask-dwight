<!-- components/ComingSoonForm.vue -->
<template>
  <div
    class="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4"
  >
    <div class="flex flex-col items-center justify-center mb-8" v-motion-slide-bottom>
      <img src="/favicons/favicon.svg" alt="Ask Dwight Logo" class="h-36 w-36 mb-4" />
      <span class="font-bold text-4xl text-gray-900 dark:text-white">Ask Dwight</span>
    </div>
    <h1 class="text-lg mb-6 dark:text-gray-400 text-gray-600" v-motion-slide-bottom :delay="100">
      AI Sales Assistant that plans your outreach, scores your leads, and boosts replies.
    </h1>

    <form
      @submit.prevent="submit"
      class="w-full max-w-md space-y-4"
      name="early-access"
      netlify
    >
    <input type="hidden" name="form-name" value="early-access" />
      <div v-motion-slide-bottom :delay="500">
        <UInput
          v-model="email"
          placeholder="you@example.com"
          type="email"
          name="email"
          required
          autofocus
        />
      </div>
      <div v-motion-slide-bottom :delay="700">
        <UButton
          :disabled="!isValidEmail"
          type="submit"
          class="w-full justify-center justify"
          label="Join the waitlist!"
        />
      </div>
      <p v-if="submitted" class="text-green-600 text-sm" v-motion-pop>
        You're on the list!
      </p>
      <p v-if="error" class="text-red-500 text-sm" v-motion-pop>
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
const email = ref("");
const submitted = ref(false);
const error = ref("");

const isValidEmail = computed(() => /\S+@\S+\.\S+/.test(email.value));

const submit = async () => {
  if (!isValidEmail.value) {
    error.value = "Please enter a valid email address.";
    return;
  }

  try {
    error.value = "";

    // Submit the form data to Netlify - using absolute URL is important for Netlify to process it correctly
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'form-name': 'early-access',
        'email': email.value
      }).toString()
    });
    
    if (!response.ok) {
      throw new Error(`Form submission failed: ${response.status}`);
    }

    submitted.value = true;
    email.value = "";
  } catch (err) {
    console.error('Submission error:', err);
    error.value = "Something went wrong. Please try again.";
  }
};
</script>

<style>
.justify-center {
  justify-content: center !important;
}
</style>
