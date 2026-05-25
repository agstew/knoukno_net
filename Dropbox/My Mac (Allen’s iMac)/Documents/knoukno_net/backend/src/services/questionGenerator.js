const { v4: uuidv4 } = require("uuid");

const THEMES = [
  "customer discovery",
  "startup budgeting",
  "business registration",
  "cash flow planning",
  "product positioning",
  "brand storytelling",
  "pricing strategy",
  "sales outreach",
  "market research",
  "vendor selection",
  "team building",
  "risk management",
  "digital marketing",
  "process automation",
  "operations planning"
];

const PROMPTS = [
  "What is your first action plan for {theme} in week {week}?",
  "How will you measure progress for {theme} this month?",
  "What low-cost experiment can validate your idea around {theme}?",
  "Which tool or resource helps you improve {theme} right now?",
  "What is one obstacle in {theme}, and how will you remove it?",
  "Who should you talk to this week to improve {theme}?",
  "How can your business stand out through better {theme}?",
  "What metric proves your {theme} strategy is working?",
  "What step makes {theme} more consistent for your business?",
  "How can you improve outcomes in {theme} without adding major costs?"
];

function buildQuestion(index) {
  const theme = THEMES[index % THEMES.length];
  const prompt = PROMPTS[index % PROMPTS.length];
  const week = (index % 12) + 1;

  return `${prompt.replace("{theme}", theme).replace("{week}", String(week))} [${uuidv4().slice(0, 8)}]`;
}

function generateUniqueQuestions(count = 300) {
  const unique = new Set();
  let i = 0;

  while (unique.size < count) {
    unique.add(buildQuestion(i));
    i += 1;
  }

  return Array.from(unique);
}

function generateUniqueExamples(count = 100) {
  const questions = generateUniqueQuestions(count);
  return questions.map((q, idx) => ({
    example: `Example ${idx + 1}: If your answer to "${q}" is unclear, break it into cost, timeline, and impact.`
  }));
}

module.exports = { generateUniqueQuestions, generateUniqueExamples };
