<template>
  <UModal v-model:open="isOpen" title="Provide Feedback">
    <UButton
      icon="i-heroicons-chat-bubble-left-ellipsis"
      size="xl"
      color="primary"
      variant="solid"
      class="fixed bottom-9 right-7 z-50 rounded-full shadow-lg"
      aria-label="Open Feedback Form"
    />
    <template #body>
      <form @submit.prevent="submit" name="feedback" netlify class="space-y-4">
        <input type="hidden" name="form-name" value="feedback" />

        <UTextarea
          id="feedback-message"
          v-model="feedbackMessage"
          name="message"
          placeholder="Tell us what you think..."
          required
          :rows="4"
          autofocus
          class="w-full"
        />

        <UButton type="submit" :disabled="!feedbackMessage.trim()" label="Send Feedback" class="w-full justify-center" />

        <p v-if="submitted" class="text-green-600 text-sm text-center pt-2" v-motion-pop>Thanks for your feedback!</p>
      </form>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isOpen = ref(false);
const feedbackMessage = ref("");
const submitted = ref(false);

const submit = async () => {
  console.log("Submitting feedback...");
  submitted.value = false; // Reset submission status on new attempt

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "form-name": "feedback",
        message: feedbackMessage.value,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Submission failed: ${response.status} ${response.statusText}`);
    }

    submitted.value = true;
    feedbackMessage.value = ""; // Clear the form

    console.log("Feedback submitted successfully");

    // Close the modal after a short delay to show success message
    setTimeout(() => {
      isOpen.value = false;
      // Reset submitted status after modal closes
      submitted.value = false;
    }, 1500);
  } catch (err: any) {
    console.error(`Something went wrong: ${err.message || "Please try again."}`);
  }
};
</script>

<style scoped></style>
