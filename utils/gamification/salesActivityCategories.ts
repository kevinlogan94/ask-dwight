/**
 * Enum representing the different sales activity categories
 */
export enum SalesActivityCategory {
  COLD_EMAIL = "cold_email",
  FOLLOW_UP_EMAIL = "follow_up_email",
  EMAIL_SEQUENCE = "email_sequence",
  SHORT_MESSAGE = "short_message",
  LEAD_GEN = "lead_gen",
  PERSONA_PITCH = "persona_pitch",
  LEAD_SCORING = "lead_scoring",
  CALL_SCRIPT = "call_script",
  OBJECTION_HANDLING = "objection_handling",
  COMPETITOR_COMPARISON = "competitor_comparison",
  CRM_SUMMARY = "crm_summary",
  OTHER = "other"
}

/**
 * Interface for category details including regex pattern and time saved value
 */
export interface CategoryDetails {
  pattern: RegExp;
  timeSaved: number;
}

/**
 * Map of each sales activity category to its details (regex pattern and time saved)
 */
export const CATEGORY_DETAILS: Record<SalesActivityCategory, CategoryDetails> = {
  // Writing a first-time email to introduce yourself or your product to a new contact
  // Checks for: "cold email", "outreach email", "prospecting email", "initial email", 
  // "first contact email", "cold outreach", "introduce myself/yourself/product"
  [SalesActivityCategory.COLD_EMAIL]: {
    pattern: /cold\s+email|outreach\s+email|prospecting\s+email|initial\s+email|first\s+contact\s+email|cold\s+outreach|introduce\s+(myself|yourself|product)/i,
    timeSaved: 12
  },

  // Writing a follow-up email to check in with someone you've already contacted
  // Checks for: "follow up email", "check in email", "following up", "second touch", "check in message"
  [SalesActivityCategory.FOLLOW_UP_EMAIL]: {
    pattern: /follow\s*up\s+email|check\s+in\s+email|following\s+up|second\s+touch|check\s+in\s+message/i,
    timeSaved: 10
  },

  // Creating a set of emails that go out over time as part of an outreach campaign
  // Checks for: "email sequence", "follow up sequence", "outreach cadence", "follow up cadence",
  // "email campaign", "follow up timing", "follow up schedule"
  [SalesActivityCategory.EMAIL_SEQUENCE]: {
    pattern: /email\s+sequence|follow\s*up\s+sequence|outreach\s+cadence|follow\s*up\s+cadence|email\s+campaign|follow\s*up\s+timing|follow\s*up\s+schedule/i,
    timeSaved: 25
  },

  // Writing a short message for platforms like LinkedIn, SMS, or Slack
  // Checks for: "short message", "linkedin message", "sms message", "slack message", 
  // "direct message", "quick note"
  [SalesActivityCategory.SHORT_MESSAGE]: {
    pattern: /short\s+message|linkedin\s+message|sms\s+message|slack\s+message|direct\s+message|quick\s+note/i,
    timeSaved: 6
  },

  // Finding potential customers based on filters like industry, title, or company size
  // Checks for: "lead gen(eration)", "find lead/prospect/customer", "prospect research", 
  // "identify lead", "target account"
  [SalesActivityCategory.LEAD_GEN]: {
    pattern: /lead\s+gen(eration)?|find\s+(lead|prospect|customer)|prospect\s+research|identify\s+lead|target\s+account/i,
    timeSaved: 20
  },

  // Creating messaging tailored to a specific role or job title, like a CFO or VP of Sales
  // Checks for: "persona pitch", "role specific message", "job title pitch", "tailored message",
  // "pitch for (cfo/ceo/vp/director/manager)"
  [SalesActivityCategory.PERSONA_PITCH]: {
    pattern: /persona\s+pitch|role\s+specific\s+message|job\s+title\s+pitch|tailored\s+message|pitch\s+for\s+(cfo|ceo|vp|director|manager)/i,
    timeSaved: 14
  },

  // Setting rules to score and prioritize leads based on how likely they are to buy
  // Checks for: "lead score/scoring", "qualify lead/prospect", "lead qualification", 
  // "prospect evaluation", "prioritize lead"
  [SalesActivityCategory.LEAD_SCORING]: {
    pattern: /lead\s+scor(e|ing)|qualify\s+(lead|prospect)|lead\s+qualification|prospect\s+evaluation|prioritize\s+lead/i,
    timeSaved: 18
  },

  // Writing a structured outline for what to say during a sales call
  // Checks for: "call script", "sales script", "call outline", "talking points", 
  // "sales call guide", "discovery call script"
  [SalesActivityCategory.CALL_SCRIPT]: {
    pattern: /call\s+script|sales\s+script|call\s+outline|talking\s+points|sales\s+call\s+guide|discovery\s+call\s+script/i,
    timeSaved: 15
  },

  // Crafting replies to common objections like "we don't have budget" or "we're not interested"
  // Checks for: "objection handle/handling", "overcome objection", "respond to objection", 
  // "handle pushback", "address concern"
  [SalesActivityCategory.OBJECTION_HANDLING]: {
    pattern: /objection\s+handl(e|ing)|overcome\s+objection|respond\s+to\s+objection|handle\s+pushback|address\s+concern/i,
    timeSaved: 10
  },

  // Explaining how your product stacks up against competitors and why it's better
  // Checks for: "competitor comparison", "competitive analysis", "versus competitor", 
  // "compare with", "stack up against", "better than competitor"
  [SalesActivityCategory.COMPETITOR_COMPARISON]: {
    pattern: /competitor\s+comparison|competitive\s+analysis|versus\s+competitor|compare\s+with|stack\s+up\s+against|better\s+than\s+competitor/i,
    timeSaved: 22
  },

  // Summarizing a sales call, meeting, or deal to add to your CRM notes
  // Checks for: "crm summary", "call summary", "meeting notes", "call notes", 
  // "deal summary", "sales call recap"
  [SalesActivityCategory.CRM_SUMMARY]: {
    pattern: /crm\s+summary|call\s+summary|meeting\s+notes|call\s+notes|deal\s+summary|sales\s+call\s+recap/i,
    timeSaved: 10
  },

  // Default category - no specific match
  [SalesActivityCategory.OTHER]: {
    pattern: /.*/, // This will match anything, but we'll only use it as a fallback
    timeSaved: 3
  }
};
