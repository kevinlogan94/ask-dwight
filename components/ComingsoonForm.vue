<!-- components/ComingSoonForm.vue -->
<template>
  <div class="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 ">
    <h1 class="text-4xl font-bold mb-2">Coming Soon</h1>
    <p class="text-lg text-gray-600 mb-6">
      Dwayne is launching soon. Get early access and updates.
    </p>

    <form @submit.prevent="submit" class="w-full max-w-md space-y-4">
      <UInput
        v-model="email"
        placeholder="you@example.com"
        type="email"
        required
        autofocus
      />
      <UButton
        :disabled="!isValidEmail"
        type="submit"
        class="w-full justify-center justify"
        label="Notify Me"
      />
      <p v-if="submitted" class="text-green-600 text-sm">You're on the list!</p>
      <p v-if="error" class="text-red-500 text-sm">
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
  try {
    error.value = "";
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "form-name": "early-access",
        email: email.value,
      }).toString(),
    });
    if (res.ok) {
      submitted.value = true;
    } else {
      throw new Error("Failed to submit.");
    }
  } catch (err) {
    error.value = "Something went wrong. Please try again.";
  }
};
</script>

<style>
.justify-center {
  justify-content: center !important;
}
</style>
