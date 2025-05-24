/**
 * Enum representing the different sales activity categories
 */
export enum SalesActivityCategory {
  PROSPECTING = "prospecting",
  OUTREACH_WRITING = "outreach_writing",
  CAMPAIGN_PLANNING = "campaign_planning",
  PITCH_AND_MESSAGING = "pitch_and_messaging",
  RESEARCH_AND_POSITIONING = "research_and_positioning",
  DEAL_SUPPORT_AND_CRM = "deal_support_and_crm",
  SALES_STRATEGY_AND_COACHING = "sales_strategy_and_coaching",
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
  // Finding leads, qualifying buyers, or identifying target accounts.
  // Matches: 'find new leads', 'qualify these prospects', 'identify target accounts for X'.
  [SalesActivityCategory.PROSPECTING]: {
    pattern: /\b(?:find\s+(?:new\s+)?(?:leads?|prospects?)|generate\s+lead\s+list|identify\s+(?:new\s+|target\s+)?(?:prospects?|accounts?|buyers?)|build\s+lead\s+list|lead\s+discovery|qualify\s+(?:buyers?|leads?|prospects?)|lead\s+qualification\s+criteria|vet\s+prospects|assess\s+lead\s+fit|ICP\s+(?:definition|development)|account\s+discovery)\b/i,
    timeSaved: 20
  },

  // Writing cold emails, LinkedIn messages, or follow-ups to prospects.
  // Matches: 'draft cold email to X', 'write LinkedIn message for Y', 'compose follow-up for Z'.
  [SalesActivityCategory.OUTREACH_WRITING]: {
    pattern: /\b(?:write|draft|compose|craft)\s+(?:(?:cold|initial|outreach|prospecting)\s+email|(?:linkedin|inmail)\s+message|connection\s+request(?:\s+message)?|(?:follow\s*up|check\s*in|reminder)\s+(?:email|message))\b/i,
    timeSaved: 12
  },

  // Building multi-step sequences or planning outreach cadences.
  // Matches: 'plan email sequence', 'build outreach cadence for X', 'design multi-step campaign for Y'.
  [SalesActivityCategory.CAMPAIGN_PLANNING]: {
    pattern: /\b(?:plan|build|create|design|develop|map\s+out|structure)\s+(?:(?:email|outreach|follow\s*up|multi\s*step|drip|nurture)\s+)?(?:sequence|cadence|campaign|series|outreach\s+plan|contact\s+strategy|sales\s+playbook)\b/i,
    timeSaved: 25
  },

  // Crafting value props, persona-specific messaging, or responses to objections.
  // Matches: 'craft value proposition for X', 'tailor message for CFOs', 'handle objection about pricing'.
  [SalesActivityCategory.PITCH_AND_MESSAGING]: {
    pattern: /\b(?:(?:craft|define|develop|write|create)\s+(?:value\s+proposition|UVP|unique\s+selling\s+point|key\s+benefits(?:\s+message)?|sales\s+pitch|elevator\s+pitch)|(?:tailor|craft|develop|write|create)\s+(?:pitch|message(?:ing)?)\s+(?:for|to)\s+(?:a\s+)?(?:persona(?:\s*specific)?|[A-Z]{2,}\b(?:\s+persona)?|specific\s+role)|(?:handle|respond\s+to|overcome|answer)\s+(?:objection|concern|pushback)(?:\s+(?:about|on|regarding|related\s+to)\s+['\"\w\s-]+)?|persona\s*specific\s+(?:pitch|message(?:ing)?))\b/i,
    timeSaved: 15
  },

  // Creating competitor comparisons, battlecards, or strategic talking points for positioning.
  // Matches: 'competitor comparison of X vs Y', 'create battlecard for Z', 'strategic talking points for product A'.
  [SalesActivityCategory.RESEARCH_AND_POSITIONING]: {
    pattern: /\b(?:competitor\s+(?:comparison|analysis|research|matrix|profile)|(?:analyze|research|compare\s+(?:us|our\s+product(?:\s+X)?)\s+(?:with|to|against|vs\.?))\s+competitor(?:\s+[-\w\s]+)?|(?:create|develop|build)\s+(?:sales\s+)?battlecard(?:\s+(?:against|for)\s+[-\w\s]+)?|strategic\s+talking\s+points|market\s+positioning\s+(?:statement|narrative|strategy)|product\s+positioning\s+(?:statement|narrative|strategy)|differentiate\s+(?:us|our\s+product(?:\s+X)?)\s+from\s+competitors?)\b/i,
    timeSaved: 18
  },

  // Summarizing meetings, writing CRM notes, or prepping internal updates related to deals.
  // Matches: 'summarize call for CRM', 'write meeting notes in Salesforce', 'prep internal deal update'.
  [SalesActivityCategory.DEAL_SUPPORT_AND_CRM]: {
    pattern: /\b(?:(?:summarize|recap|write|log|create|draft)\s+(?:meeting|call|deal|interaction)\s+(?:summary|notes|recap|log|action\s+items)(?:\s+(?:for|in|to|into)\s+(?:the\s+)?(?:CRM|Salesforce|HubSpot|Pipedrive|Zoho))?|(?:update|log\s+in|enter\s+into)\s+(?:the\s+)?(?:CRM|Salesforce|HubSpot|Pipedrive|Zoho)(?:\s+(?:with|regarding|about|on)\s+[-\w\s]+)?|prep(?:are)?\s+internal\s+(?:deal\s+review|pipeline\s+update\s+notes?|sales\s+report))\b/i,
    timeSaved: 10
  },

  // Getting advice, frameworks, or mindset support for sales situations and skill improvement.
  // Matches: 'advice on closing deals', 'framework for negotiation strategy', 'coaching on discovery calls', 'improve sales mindset'.
  [SalesActivityCategory.SALES_STRATEGY_AND_COACHING]: {
    pattern: /\b(?:advice\s+(?:on|for)|framework\s+(?:for|on)|(?:sales\s+)?coaching\s+(?:on|for)|improve\s+(?:my\s+)?|strategy\s+(?:for|on)|techniques?\s+for|help\s+with|guidance\s+on|tips\s+for)\s+(?:closing(?:\s+deals?)?|negotiation|handling\s+objections|prospecting|cold\s+calling|discovery\s+calls?|sales\s+process|time\s+management|sales\s+mindset|[-\w\s]+skill(?:s)?|overcoming\s+[-\w\s]+|building\s+rapport|account\s+planning|[-\w\s]+situation)\b/i,
    timeSaved: 10
  },

  // Default category - no specific match
  [SalesActivityCategory.OTHER]: {
    pattern: /.*/, // This will match anything, but we'll only use it as a fallback
    timeSaved: 3
  }
};
