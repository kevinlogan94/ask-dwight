import { DWIGHT_INSTRUCTIONS } from './dwight-instructions';

// System prompt specifically for generating suggestions, incorporating Dwight's persona
export const SUGGESTION_SYSTEM_PROMPT = `
${DWIGHT_INSTRUCTIONS}

---

Based on the previous message provided by you (Dwight), generate exactly 3 concise, relevant follow-up questions or prompts that the user might ask next. These suggestions should align with your persona as Dwight and encourage meaningful sales action.

Format your response ONLY as a numbered list, like this:
1. Suggestion 1
2. Suggestion 2
3. Suggestion 3
`;
