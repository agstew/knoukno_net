export const homeNarrative = `KnoUKno.net is built for the owner who is serious about turning an idea into a working business that earns real revenue and keeps moving forward. The first challenge in business is not usually motivation. The first challenge is structure. Most people can work hard for a short period of time, but they struggle to build a repeatable system that keeps producing results after the first wave of energy is gone. That is why this platform is designed around clarity, consistency, and action. Instead of jumping from one random tactic to another, you define your title, your market focus, your priority questions, your answers, and your quality scores. Then you review, rate, save, print, and improve with discipline.

A startup wins when it reduces confusion week by week. Confusion in offer positioning causes weak sales calls. Confusion in pricing causes low margin and bad cash flow. Confusion in operations causes missed deadlines and customer churn. KnoUKno.net creates a working environment where those problems are converted into decisions. Every question exists to help you decide what to do next. Every answer exists to push the business from planning to execution. Every grade and rating gives you a way to check quality, not just activity. This matters because activity can look productive while still failing to move the company forward. Progress comes from focused execution tied to measurable outcomes.

The platform supports founders, contractors, consultants, service operators, and sales teams that need practical systems. If you are launching in industrial, trade, sales, logistics, or local service markets, you need direct prompts that are built around operations and customer results. The question flow here is designed for that reality. You are guided to define your customer profile, validate your first offer, tighten your sales process, standardize delivery, and improve retention. You can then move into advanced growth: hiring, training, delegation, margin control, strategic partnerships, and recurring revenue design. This is not theory for a classroom. It is a field system for people who have to make payroll, close deals, keep promises, and protect profit.

A strong business is never one decision. It is a sequence of decisions that compound. You decide what problem you solve. You decide who pays for it. You decide how value is delivered. You decide how quality is monitored. You decide how speed improves without creating chaos. You decide how to communicate internally and externally. You decide when to reinvest and when to hold cash. You decide where the next bottleneck is and remove it before it hurts growth. KnoUKno.net gives you pages and workflows that help those decisions become visible and manageable.

The Home experience introduces the mission. Price clarifies your path by tier. Register and Login keep access controlled. Dashboard keeps your command center simple. Questions and Examples produce direction and context. Answers capture your own thinking and execution plan. Grade and Rated pages add quality control so your strategy improves over time. Average shows trend health. Print creates accountability for your team. This full loop is designed to support the founder from startup to scale.

Most businesses fail slowly before they fail publicly. They lose focus, then lose quality, then lose customer trust, then lose cash. The opposite is also true. Businesses succeed in layers: focus first, then quality, then customer trust, then repeatable sales, then durable profit. KnoUKno.net is built to help you operate in that order. If you use it daily, your planning becomes sharper, your execution gets cleaner, and your growth decisions become easier to defend with evidence. In two years, that difference is not small. It is the difference between a business that drifts and a business that leads.

The objective is simple and serious: start the business correctly, keep it moving forward, and build an operation that can survive pressure while continuing to grow. That means better questions, better answers, better reviews, and better decisions. KnoUKno.net gives you the working structure so your ambition has a system strong enough to carry it.`;

export const heroImages = [
  '/image_3583b72.png',
  'https://picsum.photos/seed/knoukno-1/900/520',
  'https://picsum.photos/seed/knoukno-2/900/520',
  'https://picsum.photos/seed/knoukno-3/900/520',
  'https://picsum.photos/seed/knoukno-4/900/520',
  'https://picsum.photos/seed/knoukno-5/900/520',
  'https://picsum.photos/seed/knoukno-6/900/520',
  'https://picsum.photos/seed/knoukno-7/900/520',
  'https://picsum.photos/seed/knoukno-8/900/520',
  'https://picsum.photos/seed/knoukno-9/900/520',
  'https://picsum.photos/seed/knoukno-10/900/520',
  'https://picsum.photos/seed/knoukno-11/900/520',
  'https://picsum.photos/seed/knoukno-12/900/520',
  'https://picsum.photos/seed/knoukno-13/900/520',
  'https://picsum.photos/seed/knoukno-14/900/520',
  'https://picsum.photos/seed/knoukno-15/900/520',
  'https://picsum.photos/seed/knoukno-16/900/520',
  'https://picsum.photos/seed/knoukno-17/900/520',
  'https://picsum.photos/seed/knoukno-18/900/520',
  'https://picsum.photos/seed/knoukno-19/900/520',
  'https://picsum.photos/seed/knoukno-20/900/520'
];

const sectors = [
  'industrial services',
  'trade operations',
  'local sales teams',
  'wholesale distribution',
  'digital storefronts',
  'field contracting',
  'construction support',
  'business consulting',
  'facility maintenance',
  'delivery operations'
];

const goals = [
  'finding profitable customers',
  'building a repeatable offer',
  'improving lead conversion',
  'tightening service quality',
  'controlling delivery speed',
  'protecting cash flow',
  'managing team accountability',
  'reducing client churn',
  'expanding recurring revenue',
  'improving margin per job'
];

const frames = [
  'What action should the business owner take first to improve {goal} in {sector}?',
  'How can a startup in {sector} create a 30 day plan for {goal}?',
  'Which process should be documented this week to strengthen {goal} for {sector}?',
  'What sales adjustment would most likely improve {goal} in {sector}?',
  'What daily metric should be reviewed to keep {goal} moving in {sector}?',
  'What client communication update would increase trust while improving {goal} in {sector}?'
];

const exampleFrames = [
  'Example strategy: In {sector}, schedule one focused prospecting block daily and one follow-up block to improve {goal}.',
  'Example execution: Build a simple checklist in {sector} so every job supports {goal} without quality drift.',
  'Example system: Use weekly scorecards in {sector} to monitor {goal} and remove bottlenecks early.',
  'Example upgrade: Create a client onboarding script for {sector} that aligns expectations and improves {goal}.',
  'Example review: Hold a Friday quality review in {sector} to evaluate wins, misses, and next actions for {goal}.',
  'Example growth move: Package services in {sector} into a clear offer ladder to increase {goal}.'
];

export function generateQuestions(total = 300) {
  const items = [];

  for (let i = 0; i < total; i += 1) {
    const sector = sectors[i % sectors.length];
    const goal = goals[Math.floor(i / sectors.length) % goals.length];
    const frame = frames[Math.floor(i / (sectors.length * goals.length)) % frames.length];
    const text = frame.replace('{goal}', goal).replace('{sector}', sector);

    items.push({
      id: i + 1,
      title: `${sector} · ${goal}`,
      text,
      image: heroImages[(i % (heroImages.length - 1)) + 1]
    });
  }

  return items;
}

export function generateExamples(total = 300) {
  const items = [];

  for (let i = 0; i < total; i += 1) {
    const sector = sectors[(i + 3) % sectors.length];
    const goal = goals[(i + 5) % goals.length];
    const frame = exampleFrames[Math.floor(i / (sectors.length * goals.length)) % exampleFrames.length];
    const text = frame.replace('{goal}', goal).replace('{sector}', sector);

    items.push({
      id: i + 1,
      title: `${sector} · example ${i + 1}`,
      text,
      image: heroImages[(i % (heroImages.length - 1)) + 1]
    });
  }

  return items;
}

export const tierRules = {
  free: { key: 'free', label: 'Free Tier', maxQuestions: 5, window: '3 days', price: '$0.00' },
  member: { key: 'member', label: 'Members Tier 50', maxQuestions: 50, window: 'Month', price: '$49.00', discount: '$39.00' },
  memberBonus: { key: 'memberBonus', label: 'Tier Member-Bonus 1 - 150', maxQuestions: 150, window: 'Month + Bonus', price: '$100.00 bonus' },
  pro: { key: 'pro', label: 'Tier Pro 1 - 75', maxQuestions: 75, window: 'Year', price: '$675.00', discount: '$436.00' },
  proBonus: { key: 'proBonus', label: 'Tier Pro-Bonus 1 - 175', maxQuestions: 175, window: 'Year + Bonus', price: '$100.00 bonus' }
};
