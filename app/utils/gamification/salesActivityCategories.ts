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
  OTHER = "other",
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
  // Matches: 'find leads', 'qualify prospects', 'lead list', 'list of business leads', 'lead scoring'.
  [SalesActivityCategory.PROSPECTING]: {
    pattern:
      /(?:\b(?:find|generate|identify|build|qualify|vet|assess|fix)\s+(?:(?:new|target|my|a)\s+)?(?:leads?|prospects?|buyers?|accounts?|lead\s+scoring(?:\s+system)?|list\s+of\s+(?:business\s+)?(?:leads?|prospects?|buyers?|accounts?))|\b(?:lead\s+(?:list|discovery|qualification|generation|scoring)|list\s+of\s+(?:business\s+)?(?:leads?|prospects?)|target\s+accounts?|ICP|ideal\s+customer\s+profile|account\s+discovery|prospect\s+research))\b/i,
    timeSaved: 20,
  },

  // Writing cold emails, LinkedIn messages, or follow-ups to prospects.
  // Matches: 'draft cold email', 'build an email', 'linkedin message', 'outreach message'.
  [SalesActivityCategory.OUTREACH_WRITING]: {
    pattern:
      /(?:\b(?:write|draft|compose|craft|build)\s+(?:(?:(?:(?:cold|initial|outreach|prospecting)\s+)?|(?:an?|the)\s+)?email|(?:linkedin|inmail)\s+message|connection\s+request(?:\s+message)?|(?:follow\s*up|check\s*in|reminder)\s+(?:email|message))\b|\b(?:outreach|linkedin|inmail)\s+message\b)/i,
    timeSaved: 12,
  },

  // Building multi-step sequences or planning outreach cadences.
  // Matches: 'plan email sequence', 'build outreach cadence', 'email sequence', 'sales playbook'.
  [SalesActivityCategory.CAMPAIGN_PLANNING]: {
    pattern:
      /(?:\b(?:plan|build|create|design|develop|map|structure)\s+(?:(?:email|outreach|follow\s*up|multi\s*step|drip|nurture)\s+)?(?:sequence|cadence|campaign|series|outreach\s+plan|contact\s+strategy|sales\s+playbook)|\b(?:email|outreach|follow\s*up|drip|nurture)\s+(?:sequence|cadence|campaign|series)|\b(?:sequence|cadence|campaign|outreach\s+plan|contact\s+strategy|sales\s+playbook))\b/i,
    timeSaved: 25,
  },

  // Crafting value props, persona-specific messaging, or responses to objections.
  // Matches: 'craft value proposition', 'tailor message for CFOs', 'value proposition', 'handle objection'.
  [SalesActivityCategory.PITCH_AND_MESSAGING]: {
    pattern:
      /(?:\b(?:craft|define|develop|write|create)\s+(?:value\s+proposition|UVP|unique\s+selling\s+point|key\s+benefits|sales\s+pitch|elevator\s+pitch)|(?:tailor|craft|develop|write|create)\s+(?:pitch|message)\s+(?:for|to)\s+(?:a\s+)?(?:persona|[A-Z]{2,}\b|specific\s+role)|(?:handle|respond|overcome|answer)\s+(?:to\s+)?(?:objection|concern|pushback)(?:\s+(?:about|on|regarding)\s+[-\w\s]{1,20})?|\b(?:value\s+proposition|UVP|unique\s+selling\s+point|key\s+benefits|sales\s+pitch|elevator\s+pitch|persona\s+specific\s+(?:pitch|message)|objection|handling\s+objections))\b/i,
    timeSaved: 15,
  },

  // Creating competitor comparisons, battlecards, or strategic talking points for positioning.
  // Matches: 'competitor analysis', 'compare us with competitor', 'battlecard', 'market positioning'.
  [SalesActivityCategory.RESEARCH_AND_POSITIONING]: {
    pattern:
      /(?:\b(?:analyze|research|compare|create|develop|build|differentiate)\s+(?:(?:us|our\s+product|product)\s+(?:with|to|against|vs|from)\s+competitor|(?:sales\s+)?battlecard(?:\s+(?:against|for)\s+[-\w]{1,15})?)|\b(?:competitor\s+(?:comparison|analysis|research|matrix|profile)|battlecard|strategic\s+talking\s+points|market\s+positioning|product\s+positioning|competitive\s+landscape|competitive\s+analysis|competitor\s+research))\b/i,
    timeSaved: 18,
  },

  // Summarizing meetings, writing CRM notes, or prepping internal updates related to deals.
  // Matches: 'summarize call notes', 'meeting summary', 'CRM notes', 'Salesforce update'.
  [SalesActivityCategory.DEAL_SUPPORT_AND_CRM]: {
    pattern:
      /(?:\b(?:summarize|recap|write|log|create|draft|update|enter|prep|prepare)\s+(?:(?:meeting|call|deal|interaction)\s+(?:summary|notes|recap|log|items)|(?:in|into)?\s+(?:the\s+)?(?:CRM|Salesforce|HubSpot|Pipedrive|Zoho)|internal\s+(?:deal|pipeline|sales)\s+(?:review|update|report))|\b(?:meeting|call|deal)\s+(?:summary|notes|recap|log|items)|\b(?:CRM|Salesforce|HubSpot|Pipedrive|Zoho)\s+(?:notes?|update|entry|report)|\bpipeline\s+(?:review|update|report))\b/i,
    timeSaved: 10,
  },

  // Getting advice, frameworks, or mindset support for sales situations and skill improvement. Also matches if 'call to action' or 'CTA' is mentioned.
  // Matches: 'advice on closing deals', 'tips for cold calling', 'strategy for negotiation', 'call to action', 'CTA'.
  [SalesActivityCategory.SALES_STRATEGY_AND_COACHING]: {
    pattern:
      /(?:\b(?:advice\s+(?:on|for)|framework\s+(?:for|on)|(?:sales\s+)?coaching\s+(?:on|for)|improve\s+(?:my\s+)?|strategy\s+(?:for|on)|techniques?\s+for|help\s+with|guidance\s+on|tips\s+for)\s+(?:closing(?:\s+deals?)?|negotiation|handling\s+objections|prospecting|cold\s+calling|discovery\s+calls?|sales\s+process|time\s+management|sales\s+mindset|[-\w\s]+skill(?:s)?|overcoming\s+[-\w\s]+|building\s+rapport|account\s+planning|[-\w\s]+situation)\b|\b(?:call\s+to\s+action|CTA)\b)/i,
    timeSaved: 10,
  },

  // Default category - no specific match
  [SalesActivityCategory.OTHER]: {
    pattern: /.*/, // This will match anything, but we'll only use it as a fallback
    timeSaved: 3,
  },
};
