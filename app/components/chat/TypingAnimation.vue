<template>
  <div class="typing-animation">
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<script setup lang="ts">
// No props or special logic needed for this simple component
</script>

<style scoped>
/* Typing animation */
.typing-animation {
  display: flex;
  align-items: center;
  column-gap: 6px;
  height: 20px;
}

.typing-animation span {
  display: block;
  width: 8px;
  height: 8px;
  background-color: #fff;
  border-radius: 50%;
  opacity: 0.4;
  animation: typing 0.5s infinite ease-in-out;
}

.typing-animation span:nth-child(1) {
  animation-delay: 0s;
}

.typing-animation span:nth-child(2) {
  animation-delay: 0.1s;
}

.typing-animation span:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes typing {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}
</style>
