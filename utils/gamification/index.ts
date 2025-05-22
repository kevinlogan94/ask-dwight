import type { Conversation } from "~/models/chat";
import { SalesActivityCategory, CATEGORY_DETAILS } from "~/utils/gamification/salesActivityCategories";

// Define our milestones in minutes
export const milestones = {
  timeSaved: [10, 30, 60, 120, 240, 480],
};

export function organizePromptInfo(prompt: string): { category: SalesActivityCategory; timeSaved: number } {
  let categories: SalesActivityCategory[] = [];

  // Default time saved (3 minutes) if no category matches
  let timeSaved = CATEGORY_DETAILS[SalesActivityCategory.OTHER].timeSaved;

  // Convert prompt to lowercase for case-insensitive matching
  const lowercasePrompt = prompt.toLowerCase();

  // Check each pattern and collect all matching categories
  Object.entries(CATEGORY_DETAILS).forEach(([category, details]) => {
    // Skip the OTHER category as it matches everything
    if (category !== SalesActivityCategory.OTHER && details.pattern.test(lowercasePrompt)) {
      categories.push(category as SalesActivityCategory);
      timeSaved += details.timeSaved;
    }
  });
  
  // If no categories match, set to "other" with default time saved
  if (categories.length === 0) {
    categories.push(SalesActivityCategory.OTHER);
    // Default time saved is already set (3 minutes)
  } else {
    // Subtract the default time we added initially
    timeSaved -= CATEGORY_DETAILS[SalesActivityCategory.OTHER].timeSaved;
  }
  
  // Cap the time saved at 30 minutes
  timeSaved = Math.min(timeSaved, 30);
  
  // For now, just return the first category if multiple match
  // We could also join them with a delimiter if needed
  return { category: categories[0], timeSaved };
}

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
