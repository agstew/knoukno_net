import db from '../src/db.mjs';

db.exec(`
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL
);
`);
const cnt = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
if (cnt === 0) {
  const Q = [
    "What problem do you solve that people already pay to fix?",
    "Who exactly is your first customer (job, location, budget)?",
    "What small promise can you deliver in one week that proves value?",
    "How will you reach your first 10 buyers without ads?",
    "What are the 3 biggest risks and how will you test them cheaply?",
    "How much will you charge for your starter offer — and why?",
    "What costs will you have before your first dollar of revenue?",
    "How will you collect money (invoice, card, link) on day one?",
    "What license/permit/registration does your state require?",
    "What insurance is prudent for your first 90 days?",
    "What makes your offer meaningfully different or faster?",
    "What proof can you show (demo, sample, testimonial) early?",
    "Which channel (referrals, partners, local listings, social) fits best now?",
    "What is your weekly time budget for the next 8 weeks?",
    "Who can say 'yes' to buying — are you talking to that person?",
    "What is the simplest version of the service/product you can sell now?",
    "How will you schedule and deliver work reliably?",
    "What are your refund/redo policies and how will you state them?",
    "What terms or contract will you use to start safely?",
    "What is your gross margin target and how will you track it?",
    "How many conversations per week will you start?",
    "What words do customers use to describe the problem?",
    "What objections have you heard and how will you answer them?",
    "How will you follow up after someone says 'not now'?",
    "What upgrade or add-on could raise average order value?",
    "What recurring need could create monthly revenue?",
    "How will you collect testimonials or case studies?",
    "What KPI will you review each Friday?",
    "What is your break-even point this month?",
    "What simple brand promise sits on your homepage?",
    "How will you handle taxes and bookkeeping from day one?",
    "What tools are essential vs. nice-to-have?",
    "What can you outsource cheaply to save time?",
    "Who can mentor you for the first 90 days?",
    "How will you prevent scope creep on fixed-price work?",
    "What standard operating procedure will you write first?",
    "How will you secure data and customer privacy?",
    "What is your policy for refunds or cancellations?",
    "How will you document delivery and acceptance?",
    "What is your pricing test plan for the first 10 customers?",
    "How will you prioritize features/requests?",
    "What churn risks do you see and how will you mitigate them?",
    "What will you stop doing if results don’t appear?",
    "How will you celebrate small wins to keep momentum?",
    "What single habit will you track daily?",
    "Who is your accountability partner?",
    "What could derail your focus next week?",
    "What’s your runway in weeks of expenses?",
    "What is your 30/60/90-day milestone map?",
    "Why is now the right time for you to start?"
  ];
  const ins = db.prepare('INSERT INTO questions(text) VALUES (?)');
  db.transaction(arr => { for (const t of arr) ins.run(t); })(Q);
  console.log('Seeded', Q.length, 'questions');
} else {
  console.log('Questions present:', cnt);
}
