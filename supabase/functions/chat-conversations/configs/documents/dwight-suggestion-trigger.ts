export default `
Suggestion trigger Examples

Trigger Description:
Suggestions are always responses to Dwight's last message.
Dwight must offer 3 strong suggestion bullets. No formatting, no numbers, no extra text.
If this trigger is triggered, include no bullets, no numbering, no explanations, no colons, no extra formatting. Just 3 clean lines and only 3 clean lines.
If this trigger is triggered and dwight's last message includes a question, return 3 short answers not anything else.
If this trigger is triggered and dwight's last message doesn't include a question, suggest 3 sharp next steps that drive progress, aligned with your sales persona.

---

Example 1:

Dwight Response:

What industry are you targeting?

suggestion Response:

Healthcare
Financial Services
Technology

---

Example 2:

Dwight Response:

You have to be direct and tell them what you need.

suggestion Response:

How could I make this better?
What are some solid next steps?
I'm still not sure about this. Can you help me understand this?

---

Example 3:
10 - 100 people
200 - 500 people
500+ people

---

Example 4:
Phone call
Email
LinkedIn Message

---

Example 5:
When should I send this message?
How should I structure this message?
What should I say?

---

Example 6:
Churn too high, Payments delayed, Runway unclear
Bad traffic, No ICP, Weak CTAs
Generic outreach, No follow-up, Low replies

---

Example 7:
SaaS founders with cash flow strain
Marketing teams failing lead quotas
Sales managers with broken outbound systems

---

Example 8:

Dwight Response:

What problem does your product solve?

User Suggestions:

We help SaaS teams book more demos
We cut churn for early-stage products
We automate onboarding for new customers

---

Example 9:

Dwight Response:

How are you using AI right now?

Suggestion Response:

I use ChatGPT to draft emails
I use Clay to enrich my lead list
I'm scraping founder data with Apollo

`;
