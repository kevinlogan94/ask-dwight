import type { Conversation } from "~/models/chat";
import { SalesActivityCategory, CATEGORY_DETAILS } from "~/utils/gamification/salesActivityCategories";

// Define our milestones in minutes
export const milestones = {
  timeSaved: [10, 30, 60, 120, 240, 480],
};

export function organizePromptInfo(prompt: string): { category: SalesActivityCategory; timeSaved: number } {
  const lowercasePrompt = prompt.toLowerCase();
  let matchedCategories: { category: SalesActivityCategory; timeSaved: number }[] = [];

  Object.entries(CATEGORY_DETAILS).forEach(([categoryKey, details]) => {
    // Skip the OTHER category in this initial matching phase
    // It will be used as a fallback if no other categories match.
    if (categoryKey === SalesActivityCategory.OTHER) {
      return;
    }

    if (details.pattern.test(lowercasePrompt)) {
      matchedCategories.push({ category: categoryKey as SalesActivityCategory, timeSaved: details.timeSaved });
    }
  });

  if (matchedCategories.length === 0) {
    // If no specific category matched, default to OTHER
    return {
      category: SalesActivityCategory.OTHER,
      timeSaved: CATEGORY_DETAILS[SalesActivityCategory.OTHER].timeSaved,
    };
  }

  // Sort by timeSaved in descending order to easily pick the best match
  matchedCategories.sort((a, b) => b.timeSaved - a.timeSaved);

  // The first element is the one with the highest timeSaved
  return matchedCategories[0];
}

//todo: Replace this with a database query that does a summation on timeSaved.
/**
 * Calculates the total time saved across all conversations
 * @param conversations Array of conversations to calculate total time saved for
 * @returns Total time saved in minutes
 */
export function getTotalTimeSaved(conversations: Conversation[]): number {
  if (!conversations || conversations.length === 0) return 0;

  let totalTimeSaved = 0;

  for (const conversation of conversations) {
    const userMessages = conversation.messages.filter((msg) => msg.sender === "user");

    for (const message of userMessages) {
      const { timeSaved } = organizePromptInfo(message.content);
      totalTimeSaved += timeSaved;
    }
  }

  return totalTimeSaved;
}
