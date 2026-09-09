import OpenAI from 'openai';
import { config } from '../config/env.js';

const STAGES = ['law', 'location', 'hiring', 'people'];

const STAGE_BRIEF = {
  law: 'Legal formation: entity type, registration, licences, permits, tax IDs, contracts, insurance, compliance.',
  location:
    'Location: market and site selection, foot traffic, zoning, lease terms, rent versus revenue, online versus physical presence.',
  hiring:
    'Hiring: which roles to fill first, the type of person to hire, pay, onboarding, training, contractors versus employees.',
  people:
    'The people who come to your business: the customer, their problem, how they find you, what keeps them coming back.',
};

const OFFLINE_ANGLES = {
  law: [
    'legal structure and why it fits the owner',
    'business-name availability and registration',
    'federal tax identification and state tax registration',
    'industry licences and local permits',
    'ownership percentages and decision authority',
    'operating agreement or partnership terms',
    'business insurance and personal liability',
    'customer and supplier contract terms',
    'employment-law responsibilities',
    'record retention and compliance deadlines',
    'intellectual-property protection',
    'professional legal and accounting review',
    'the final legal checklist before opening',
  ],
  location: [
    'where the target customer already spends time',
    'online, mobile, home-based, or physical operation',
    'zoning and permitted use',
    'foot traffic, vehicle traffic, and visibility',
    'rent compared with expected monthly revenue',
    'lease length, renewal, and exit terms',
    'parking, delivery, and accessibility',
    'nearby competitors and complementary businesses',
    'utilities, build-out, and hidden site costs',
    'security and operating-hour restrictions',
    'staff travel and supplier access',
    'a backup location if the first choice fails',
    'the final evidence supporting the location decision',
  ],
  hiring: [
    'the first role the owner cannot cover alone',
    'the skills that must already be present',
    'the character and work habits the role requires',
    'employee versus contractor classification',
    'wages, taxes, benefits, and full hiring cost',
    'where qualified candidates will be found',
    'interview questions tied to real work',
    'reference and background checks',
    'the first-week onboarding plan',
    'training standards and documentation',
    'thirty-day measures of a successful hire',
    'scheduling, coverage, and absence planning',
    'the final hiring decision and start date',
  ],
  people: [
    'the single clearest description of the customer',
    'the customer problem worth paying to solve',
    'how the customer discovers the business',
    'what earns the first purchase',
    'the experience the customer expects',
    'price sensitivity and buying objections',
    'what creates a second visit or purchase',
    'how complaints and refunds will be handled',
    'how customer information and privacy are protected',
    'how feedback changes the business',
    'which customers the business does not serve',
    'how referrals and reputation will grow',
    'the final promise made to every customer',
  ],
};

// Used when no OpenAI key is set, so the Example page still shows real worked copy.
const OFFLINE_EXAMPLE = {
  law: (name, place) =>
    `Here is the shape of a strong answer. Somebody opening a business like ${name} would not write "I will register the company" and stop there. They would name the entity and say why: "I am filing a single-member LLC${place ? ` in ${place}` : ''} because it separates my personal savings from the business, and I can add a partner later without starting over."\n\nThen they would list what the filing actually needs — the registered agent, the operating agreement, the EIN from the IRS, and the state and city licences the trade requires. They would put a date and a cost against each one, and they would name the person who signs. If an accountant or a lawyer has to review it, they would say which, and by when.\n\nThey would finish with the thing most people skip: what happens if it goes wrong. Which insurance the landlord will demand before handing over keys, and who can act for the business if the owner is out for a month.\n\nNotice that the example never decides for you. It shows the level of detail — a named step, a date, a cost, and a person — that turns an intention into a plan.`,
  location: (name, place) =>
    `A strong answer here defends the choice with numbers, not a feeling. Somebody siting a business like ${name} would write something closer to: "I want the corner unit${place ? ` in ${place}` : ''} at $2,400 a month. At an average sale of $9 I need about 270 sales a month just to cover rent, and the morning count on that block is roughly 400 people an hour between seven and nine."\n\nThey would then say what the lease locks them into — the term, the break clause, who pays for the fit-out — and whether the zoning actually permits the trade without a variance.\n\nAnd they would name a second choice. "If the corner falls through, the cheaper unit two streets back is $1,500 but almost no walk-in traffic, so I would have to spend the difference on getting found online."\n\nThe example shows the shape: a specific site, the rent against realistic revenue, what the lease commits you to, and a fallback. The site you pick is still yours to pick.`,
  hiring: (name) =>
    `A strong answer describes a person, not a headcount. Rather than "I need staff", somebody hiring for ${name} would write: "My first hire covers the morning shift on their own, so they have to be able to open, handle the rush without me, and close out the till correctly. I care more that they are steady and honest than that they are experienced — I can teach the work."\n\nThey would put real numbers to it: the hourly rate, the hours, whether it is an employee or a contractor and why, and what the role costs once tax and insurance are counted.\n\nThey would say how they will know it worked. "Inside thirty days I want them opening alone twice a week without a single till discrepancy. If that is not happening, I made the wrong hire."\n\nAnd they would name the part of the job they are not handing over yet, and when they might.\n\nThe example shows the level of detail. Which person you actually need is still your call.`,
  people: (name) =>
    `A strong answer names one customer, not "everyone". Somebody describing the people who come to ${name} would write: "My customer is the person walking to work between seven and nine who wants something better than a petrol-station coffee and cannot afford to wait ten minutes. Their problem is time, not taste."\n\nThey would say how that person finds them the first time — the sign, the corner, a neighbour, a map listing — and be honest about which of those they can actually influence.\n\nThen the harder half: what brings the person back a second time. "Speed. If I cannot serve them in ninety seconds they will not come back, no matter how good the coffee is."\n\nThey would finish by naming who they are not for, because a business that tries to serve everyone gets chosen by no one.\n\nThe example shows the shape — one person, one problem, how they find you, what brings them back. Who your customer is remains yours to answer.`,
};

let client = null;

// Placeholder keys from .env.example must not be treated as configured.
const hasRealKey = () => {
  const key = config.openai.apiKey;
  return Boolean(key) && key.startsWith('sk-') && !/replace|change|your[-_]?key|xxx/i.test(key);
};

function getClient() {
  if (!hasRealKey()) return null;
  if (!client) client = new OpenAI({ apiKey: config.openai.apiKey });
  return client;
}

export const isAiConfigured = () => hasRealKey();

/** Maps a 1-based question index onto the law -> location -> hiring -> people arc. */
export function stageForPosition(position, total) {
  const bucket = Math.ceil((position / Math.max(total, 1)) * STAGES.length);
  return STAGES[Math.min(Math.max(bucket, 1), STAGES.length) - 1];
}

function offlinePrompt({ business, stage, position, total }) {
  let stageStart = position;
  while (stageStart > 1 && stageForPosition(stageStart - 1, total) === stage) stageStart -= 1;
  const angle = OFFLINE_ANGLES[stage][(position - stageStart) % OFFLINE_ANGLES[stage].length];
  const industry = business.industry
    ? /business$/i.test(business.industry)
      ? business.industry
      : `${business.industry} business`
    : null;
  const details = business.industry && business.location
    ? `, a ${industry} in ${business.location}`
    : business.industry
      ? `, a ${industry}`
      : business.location
        ? ` in ${business.location}`
        : '';

  return `For ${business.business_title}${details}, focus on ${angle}. Explain the specific decision you will make, the evidence or cost behind it, who is responsible, and the date it must be completed. What is your answer?`;
}

function offlineExample({ business, stage, position, total }) {
  let stageStart = position;
  while (stageStart > 1 && stageForPosition(stageStart - 1, total) === stage) stageStart -= 1;
  const angle = OFFLINE_ANGLES[stage][(position - stageStart) % OFFLINE_ANGLES[stage].length];
  const place = business.location ? ` in ${business.location}` : '';

  return `For example, a founder working on ${angle} for a company like ${business.business_title}${place} could write: "I compared the available choices, recorded the cost and risk of each one, and selected the option that best supports the business plan. I will confirm the decision with the appropriate professional or agency before spending money or signing an agreement."

The founder would then make the answer measurable: "The owner is responsible. The research budget is $500, supporting documents will be saved with the business records, and the decision must be completed within thirty days. If approval is required, the business will not move to the next step until written approval is received."

This example is specifically about ${angle}. A strong answer names the actual choice, evidence, cost, responsible person, deadline, and backup action for question ${position}. Your facts and final decision must come from you.`;
}

function systemPrompt() {
  return [
    'You are the question writer for Kno U Kno, a guided workbook that walks a founder',
    'from the very first legal step to an open, staffed, customer-facing business.',
    'You never answer for the founder — the answer always comes from them.',
    'You ask the same underlying business question in a different way each time so the',
    'founder is pushed to think harder, and you always end with a direct question.',
    'Make the founder resolve competing priorities, quantify evidence, identify legal and',
    'financial risks, name an accountable person, set a deadline, and define a fallback.',
    'Write in plain, warm, second-person English. No markdown headings, no bullet lists.',
    'Return strict JSON only.',
  ].join(' ');
}

export function countWords(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

export function validGeneratedQuestion({ prompt, example }, targetWords) {
  const minimum = Math.floor(targetWords * 0.9);
  const maximum = Math.ceil(targetWords * 1.1);
  const promptWords = countWords(prompt);
  const exampleWords = countWords(example);
  return (
    promptWords >= minimum &&
    promptWords <= maximum &&
    exampleWords >= minimum &&
    exampleWords <= maximum &&
    String(prompt).trim().endsWith('?')
  );
}

async function requestQuestion(ai, messages) {
  const completion = await ai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.8,
    response_format: { type: 'json_object' },
    messages,
  });
  const parsed = JSON.parse(completion.choices[0].message.content);
  return {
    prompt: String(parsed.prompt || '').trim(),
    example: String(parsed.example || '').trim(),
  };
}

function userPrompt({ business, stage, position, total, previousPrompts, words }) {
  return `Business title: ${business.business_title}
Industry: ${business.industry || 'not specified'}
Location: ${business.location || 'not specified'}
What they described: ${business.description || 'not specified'}

Write question ${position} of ${total}. Stage: ${stage.toUpperCase()} — ${STAGE_BRIEF[stage]}

Already asked (do not repeat these angles):
${previousPrompts.length ? previousPrompts.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'none yet'}

Return JSON with exactly these keys:
{
  "prompt": "roughly ${words} words of context specific to this business that reframes the stage topic, ending in one clear question the founder must answer",
  "example": "roughly ${words} words showing a worked example for a business like theirs, so they can see the shape of a strong answer — never the answer itself"
}`;
}

export async function generateQuestion({ business, position, total, previousPrompts = [] }) {
  const stage = stageForPosition(position, total);
  const words = config.openai.questionWords;
  const ai = getClient();

  if (!ai) {
    return {
      stage,
      model: 'offline-fallback',
      prompt: offlinePrompt({ business, stage, position, total }),
      example: offlineExample({ business, stage, position, total }),
    };
  }

  const messages = [
    { role: 'system', content: systemPrompt() },
    { role: 'user', content: userPrompt({ business, stage, position, total, previousPrompts, words }) },
  ];
  let generated = await requestQuestion(ai, messages);
  if (!validGeneratedQuestion(generated, words)) {
    generated = await requestQuestion(ai, [
      ...messages,
      { role: 'assistant', content: JSON.stringify(generated) },
      {
        role: 'user',
        content: `Rewrite both fields to ${words} words each (within 10%). Keep the prompt difficult and end it with a question mark. Return only the corrected JSON.`,
      },
    ]);
  }
  if (!validGeneratedQuestion(generated, words)) {
    throw new Error(`AI output did not meet the ${words}-word question and example requirement`);
  }
  return {
    stage,
    model: config.openai.model,
    ...generated,
  };
}

/** ~400 words of landing-page copy per section, written by the AI. */
export async function generateLandingSection({ slug, heading, angle }) {
  const words = config.openai.landingWords;
  const ai = getClient();
  if (!ai) {
    throw new Error('OpenAI is not configured — set OPENAI_API_KEY to write landing copy.');
  }

  const completion = await ai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You write landing page copy for Kno U Kno (knoukno.co), a guided workbook that shows people how to start a business from the basics all the way to the finish: law, location, people, and hiring. Plain second-person English, confident, no hype, no markdown. Return strict JSON.',
      },
      {
        role: 'user',
        content: `Section slug: ${slug}
Heading: ${heading}
Angle: ${angle}

Return JSON: {"heading": "...", "body": "roughly ${words} words in 4-6 plain paragraphs separated by \\n\\n"}`,
      },
    ],
  });

  const parsed = JSON.parse(completion.choices[0].message.content);
  return { heading: parsed.heading || heading, body: String(parsed.body || '').trim() };
}

/** Used by admin.js to draft the three transactional emails. */
export async function generateEmailCopy({ template, context = {} }) {
  const ai = getClient();
  if (!ai) return null;

  const completion = await ai.chat.completions.create({
    model: config.openai.model,
    temperature: 0.6,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You write short transactional email copy for Kno U Kno (knoukno.co). Friendly, direct, no hype, no markdown. Return strict JSON.',
      },
      {
        role: 'user',
        content: `Template: ${template}
Context: ${JSON.stringify(context)}

Return JSON: {"subject": "under 60 characters", "intro": "1-2 sentences", "body": "2-3 short paragraphs separated by \\n\\n", "cta": "button label under 4 words"}`,
      },
    ],
  });

  return JSON.parse(completion.choices[0].message.content);
}
