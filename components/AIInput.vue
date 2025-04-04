<template>
    <div class="chat-input-container">
      <UInput
        v-model="message"
        placeholder="Ask me anything"
        icon="i-lucide-message-square"
        @keyup.enter="sendMessage"
        @click:trailing="sendMessage"
        size="lg"
        class="chat-input"
      >
      <template #trailing>
        <UButton
          variant="link"
          size="sm"
          icon="i-lucide-copy"
          aria-label="Copy to clipboard"
          @click="copy"
        />
    </template>
    </UInput>
    </div>
  </template>
  
  <script setup>
  const message = ref('')
  const copied = ref(false)
  
  const sendMessage = () => {
    // Handle sending the message
    console.log(message.value)
    message.value = ''
  }

  const copy = () => {
    // Copy functionality here
    navigator.clipboard.writeText(message.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  </script>
  
  <style scoped>
  .chat-input-container {
    margin: auto;
    width: 90%;
    max-width: 800px;
    height: 100px;
    border-radius: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  </style>