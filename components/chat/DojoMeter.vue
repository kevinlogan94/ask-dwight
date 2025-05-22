<template>
  <div>
    <!-- Tooltip wrapper -->
    <UTooltip
      :text="tooltipText"
      :content="{ side: 'top' }"
      :open="showViaMilestone || showViaEvent"
      :delayDuration="50"
      :ui="{ text: 'text-lg' }"
    >
      <div
        class="relative flex items-center justify-center w-11 h-11 bg-neutral-800/70 hover:bg-neutral-900 backdrop-blur-sm rounded-full shadow-lg"
        @mouseenter="showViaEvent = true"
        @mouseleave="showViaEvent = false"
        @click="showViaEvent = !showViaEvent"
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
          :class="{ 'text-gray-200 dark:text-gray-500': !isComplete, 'text-green-500': isComplete }"
        >
          <UIcon name="i-heroicons-bolt" class="w-6 h-6" />
        </div>

        <!-- Lightning effect (only visible when milestone reached) -->
        <template v-if="showExplosion">
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

          <!-- Particles for additional effect -->
          <div
            v-for="n in 8"
            :key="`particle-${n}`"
            class="absolute w-2.5 h-2.5 rounded-full animate-particle"
            :style="getExplosionParticleStyle(n)"
          ></div>
        </template>
      </div>
    </UTooltip>
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

// Persistent storage
const lastMilestoneReached = useLocalStorage("last-milestone", {
  timeSaved: 0,
});

// States for animations and feedback
const showExplosion = ref(false);
const showViaMilestone = ref(false);
const showViaEvent = ref(false);
const reachedMilestone = ref(0);

//----------------------------------------------
// COMPUTED PROPERTIES
//----------------------------------------------

// Progress calculations
const nextMilestone = computed(() => {
  return (
    milestones.timeSaved.find((milestone) => milestone > lastMilestoneReached.value.timeSaved) ||
    lastMilestoneReached.value.timeSaved
  );
});

const minutesToNextMilestone = computed(() => {
  return Math.max(0, nextMilestone.value - totalSavedTime.value);
});

const progressPercentage = computed(() => {
  if (lastMilestoneReached.value.timeSaved >= nextMilestone.value) {
    return 100;
  }

  const currentProgress = totalSavedTime.value - lastMilestoneReached.value.timeSaved;
  const targetProgress = nextMilestone.value - lastMilestoneReached.value.timeSaved;

  return Math.min(100, Math.max(0, (currentProgress / targetProgress) * 100));
});

const isComplete = computed(() => progressPercentage.value >= 100);

// UI elements
const tooltipText = computed(() => {
  if (isComplete.value) {
    return "Milestone reached!";
  }
  return `${totalSavedTime.value} min saved — ${minutesToNextMilestone.value} to next milestone`;
});

// Circular progress bar
const circumference = 2 * Math.PI * 16;
const dashOffset = computed(() => {
  return circumference * (1 - progressPercentage.value / 100);
});

//----------------------------------------------
// ANIMATIONS
//----------------------------------------------

// Particle animation
const explosionAnimation = {
  initial: { opacity: 0, scale: 0 },
  enter: {
    opacity: [0, 1, 0.5, 0, 0.5, 0],
    scale: [0, 1.5, 1, 0.8, 1.2, 0],
    transition: {
      duration: 5,
      repeat: 1,
      ease: "easeInOut",
    },
  },
};

//----------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------

// Particles positioning
function getExplosionParticleStyle(index: number) {
  const angle = (index / 8) * 2 * Math.PI;
  const distance = 12 + Math.random() * 8;

  return {
    left: `calc(50% + ${Math.cos(angle) * distance}px)`,
    top: `calc(50% + ${Math.sin(angle) * distance}px)`,
    animationDelay: `${Math.random() * 0.2}s`,
  };
}

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
  (newValue) => {
    if (isComplete.value && !showExplosion.value) {
      // Capture milestone for display
      reachedMilestone.value = nextMilestone.value;

      // Show celebration effects
      showExplosion.value = true;
      showViaMilestone.value = true;

      // Handle cleanup timing
      setTimeout(() => {
        // Update saved milestone
        lastMilestoneReached.value.timeSaved = nextMilestone.value;
        showExplosion.value = false;

        // Keep tooltip visible a bit longer
        setTimeout(() => {
          showViaMilestone.value = false;
        }, 2000);
      }, 5500);
    }
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
