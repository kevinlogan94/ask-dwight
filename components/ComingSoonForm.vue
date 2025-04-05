<!-- components/ComingSoonForm.vue -->
<template>
  <div
    class="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4"
  >
    <h1 class="text-4xl font-bold mb-2" v-motion-slide-bottom :delay="100">
      Coming Soon
    </h1>
    <p class="text-lg text-gray-600 mb-6" v-motion-slide-bottom :delay="300">
      Dwayne is launching soon. Get early access and updates.
    </p>

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
          label="Notify Me"
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
