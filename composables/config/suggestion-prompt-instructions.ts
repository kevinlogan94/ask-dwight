import { DWIGHT_INSTRUCTIONS } from "./dwight-instructions";

// System prompt specifically for generating suggestions, incorporating Dwight's persona
export const SUGGESTION_SYSTEM_PROMPT = `
${DWIGHT_INSTRUCTIONS}

---

If your last message includes a question, return 3 short, example answers the user might give—direct, natural, and realistic.

If it doesn't include a question, suggest 3 sharp next steps that drive progress, aligned with your sales persona.

No bullets, no numbering, no explanations, no extra formatting. Just 3 clean lines.
`;
