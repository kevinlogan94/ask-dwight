import type { Conversation } from "~/models/chat";

export function organizePromptInfo(prompt: string): { category: string; timeSaved: number } {
  let category = "other";
  let timeSaved = 3; // Default time saved for "other" category

  // Convert prompt to lowercase for case-insensitive matching
  const lowercasePrompt = prompt.toLowerCase();

  // Check for lead scoring patterns
  if (
    /lead\s+scor(e|ing)|qualify\s+(lead|prospect)|lead\s+qualification|prospect\s+evaluation/i.test(lowercasePrompt)
  ) {
    category = "lead_scoring";
    timeSaved = 5; // 5 minutes saved for lead scoring prompts
  }
  // Check for follow-up cadence patterns
  else if (
    /follow\s*up\s+cadence|email\s+sequence|follow\s*up\s+sequence|outreach\s+cadence|follow\s*up\s+timing|follow\s*up\s+schedule/i.test(
      lowercasePrompt,
    )
  ) {
    category = "follow_up_cadence";
    timeSaved = 12; // 12 minutes saved for follow-up cadence prompts
  }
  // Check for cold email patterns
  else if (
    /cold\s+email|outreach\s+email|prospecting\s+email|initial\s+email|first\s+contact\s+email|cold\s+outreach/i.test(
      lowercasePrompt,
    )
  ) {
    category = "cold_email";
    timeSaved = 8; // 8 minutes saved for cold email prompts
  }

  return { category, timeSaved };
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
