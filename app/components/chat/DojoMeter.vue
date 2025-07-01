<template>
  <div>
    <!-- Tooltip wrapper -->
    <UTooltip
      :text="tooltipText"
      :content="{ side: 'top' }"
      :open="showMilestoneReachedVisuals || showTooltipViaEvent"
      :delayDuration="50"
      :ui="{ text: 'text-lg' }"
    >
      <div
        class="relative flex items-center justify-center w-11 h-11 bg-neutral-800/70 hover:bg-neutral-900 backdrop-blur-sm rounded-full shadow-lg"
        @mouseenter="showTooltipViaEvent = true"
        @mouseleave="showTooltipViaEvent = false"
        @click="showTooltipViaEvent = !showTooltipViaEvent"
      >
        <!-- Circular progress bar -->
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36" overflow="visible">
          <!-- Progress Background circle -->
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            class="text-gray-100 dark:text-gray-700"
            stroke-width="2"
          />
          <!-- Progress circle -->
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            class="text-success-500 transition-all duration-500 ease-in-out"
            stroke-width="2"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>

        <!-- Bolt icon in the center -->
        <div
          class="absolute inset-0 flex items-center justify-center"
          :class="{
            'text-gray-200 dark:text-gray-500': !showMilestoneReachedVisuals,
            'text-green-500': showMilestoneReachedVisuals,
          }"
        >
          <UIcon name="i-lucide-zap" class="w-6 h-6" />
        </div>

        <!-- Lightning effect (only visible when milestone reached) -->
        <template v-if="showMilestoneReachedVisuals">
          <!-- Lightning bolts that shoot outward -->
          <svg
            v-for="n in 6"
            :key="n"
            class="absolute top-0 left-0 w-full h-full pointer-events-none"
            :style="getLightningStyle(n)"
          >
            <path
              :d="getLightningPath(n)"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              class="text-success-400 animate-lightning"
              stroke-linecap="round"
              stroke-linejoin="round"
              :style="{ animationDelay: `${n * 0.2}s` }"
            />
          </svg>
        </template>
      </div>
    </UTooltip>

    <UModal v-model:open="isModalOpen" title="Milestone Dominated. Belt Earned.">
      <template #body>
        <p class="text-center">You executed a clean strike and saved {{ formatTimeSaved(totalSavedTime, true) }}.</p>
        <p class="text-center">Form: acceptable. Focus: unwavering.</p>

        <p v-if="!user" class="text-center text-sm text-neutral-500 mt-5">
          <ULink to="/auth/login" class="text-success">Log in</ULink> to preserve your time domination across
          conversations..
        </p>

        <UButton label="Back to battle!" class="w-full justify-center mt-5" @click="isModalOpen = false" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useGamification } from "~/composables/useGamification";
import { milestones } from "~/utils/gamification";
import { useLocalStorage } from "@vueuse/core";

//----------------------------------------------
// STATE MANAGEMENT
//----------------------------------------------

// Service connection
const { totalSavedTime } = useGamification();
const user = useSupabaseUser();
const chatStore = useChatStore();

const milestoneTutorialModalDisplayed = useLocalStorage("milestone-tutorial-modal-displayed", false);

// States
const showTooltipViaEvent = ref(false);
const isModalOpen = ref(false);

const showMilestoneReachedVisuals = ref(false);
const lastConversationId = ref<string | null>(null);

//----------------------------------------------
// COMPUTED PROPERTIES
//----------------------------------------------

// Progress calculations
const nextMilestone = computed(() => {
  //return the first milestone that is larger than the total saved time
  return (
    milestones.timeSaved.find((milestone) => milestone > totalSavedTime.value) ||
    milestones.timeSaved[milestones.timeSaved.length - 1]
  );
});

const minutesToNextMilestone = computed(() => {
  return Math.max(0, nextMilestone.value - totalSavedTime.value);
});

const progressPercentage = computed(() => {
  if (showMilestoneReachedVisuals.value || totalSavedTime.value >= nextMilestone.value) {
    return 100;
  }

  const currentProgress = totalSavedTime.value;
  const targetProgress = nextMilestone.value;

  return Math.min(100, Math.max(0, (currentProgress / targetProgress) * 100));
});

// UI elements
const tooltipText = computed(() => {
  if (showMilestoneReachedVisuals.value) {
    return "Milestone Dominated. Belt Earned.";
  }
  return `${formatTimeSaved(totalSavedTime.value)} saved — ${formatTimeSaved(minutesToNextMilestone.value)} to go`;
});

// Circular progress bar
const circumference = 2 * Math.PI * 16;
const dashOffset = computed(() => {
  return circumference * (1 - progressPercentage.value / 100);
});

//----------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------

// Lightning bolt styling
function getLightningStyle(index: number) {
  const angle = (index / 6) * 360;
  return { transform: `rotate(${angle}deg)` };
}

// Lightning path generation
function getLightningPath(index: number) {
  const startX = 18;
  const startY = 18;
  const zigzagCount = 3 + Math.floor(Math.random() * 2);
  const length = 35;
  const segmentLength = length / zigzagCount;

  let path = `M ${startX} ${startY}`;
  let currentX = startX;
  let currentY = startY;

  for (let i = 0; i < zigzagCount; i++) {
    currentX += segmentLength * (0.7 + Math.random() * 0.3);
    currentY += (Math.random() - 0.5) * 10;
    path += ` L ${currentX} ${currentY}`;
  }

  return path;
}

//----------------------------------------------
// WATCHERS & EFFECTS
//----------------------------------------------

// Monitor milestone completion
watch(
  totalSavedTime,
  (newValue, oldValue) => {
    // --- 1. Track conversation changes ---
    const isNewConversation = (chatStore.selectedConversation?.messages.length ?? 0) <= 2;
    const isChangedConversation = chatStore.selectedConversation?.id !== lastConversationId.value;

    // skip milestone checks if we just opened the app
    if (!chatStore.anyMessagesSentForCurrentSession) return;

    // Update conversation tracking for new conversations
    if (isNewConversation) {
      lastConversationId.value = chatStore.selectedConversation?.id ?? null;
    }

    // Skip milestone checks if we switched to a different existing conversation
    if (isChangedConversation && !isNewConversation) {
      lastConversationId.value = chatStore.selectedConversation?.id ?? null;
      return;
    }

    // --- 2. Check for milestone crossing ---
    const prevValue = oldValue ?? 0;
    const crossedMilestone = milestones.timeSaved.find((milestone) => prevValue < milestone && newValue >= milestone);

    // Skip if no milestone was crossed
    if (!crossedMilestone) return;

    // --- 3. Handle milestone celebration ---
    showMilestoneReachedVisuals.value = true;

    // Track the event
    useTrackEvent("dojoMeter_milestone_reached", {
      event_category: "gamification",
      event_label: "milestone_reached",
      value: { reachedMilestone: crossedMilestone },
      non_interaction: false,
    });

    // Auto-hide celebration after delay
    setTimeout(() => {
      // Show tutorial modal if this is the first milestone
      if (!milestoneTutorialModalDisplayed.value) {
        isModalOpen.value = true;
        milestoneTutorialModalDisplayed.value = true;
      }

      showMilestoneReachedVisuals.value = false;
    }, 3000);
  },
  { immediate: true },
);
</script>

<style scoped>
.animate-lightning {
  animation: lightning 0.5s ease-out infinite;
  stroke-dasharray: 90;
  stroke-dashoffset: 90;
}

@keyframes lightning {
  0%,
  100% {
    opacity: 0;
    stroke-dashoffset: 90;
  }
  10%,
  15% {
    opacity: 1;
  }
  40% {
    opacity: 0;
    stroke-dashoffset: 0;
  }
  41% {
    stroke-dashoffset: 90;
  }
  50%,
  55% {
    opacity: 1;
  }
  80% {
    opacity: 0;
    stroke-dashoffset: 0;
  }
}
</style>
