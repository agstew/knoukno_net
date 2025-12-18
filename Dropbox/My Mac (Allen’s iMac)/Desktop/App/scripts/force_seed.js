const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kno-u-kno';

const questions = [
  { id: 1, title: 'How should I set up business bank accounts?', text: 'Separate personal and business accounts, choose a bank with low fees and robust online tools, and set up a simple bookkeeping flow to reconcile weekly.' },
  { id: 2, title: 'What business entity should I form?', text: 'Compare sole proprietorship, LLC, S-corp, and C-corp considering liability, taxes, administrative burden, and future investment plans.' },
  { id: 3, title: 'How do I create a basic cashflow forecast?', text: 'List expected monthly income and expenses, include payment timing for receivables and payables, and maintain a rolling 90-day forecast with conservative assumptions.' },
  { id: 4, title: 'How can I speed up customer payments?', text: 'Offer incentives for upfront payment, use recurring billing or direct debit, and issue clear, timely invoices with payment links.' },
  { id: 5, title: 'What taxes should I be aware of?', text: 'Identify sales tax, payroll tax, and income tax obligations for your jurisdiction and set aside a percentage of revenue to cover expected tax bills.' },
  { id: 6, title: 'How do I price to ensure profitability?', text: 'Calculate direct costs, allocate overhead, target a gross margin, and test pricing tiers on a small scale to measure willingness to pay.' },
  { id: 7, title: 'When should I hire versus outsource?', text: 'Hire for persistent, high-value tasks that increase revenue or quality; outsource variable or specialist tasks to control fixed costs.' },
  { id: 8, title: 'How do I protect intellectual property?', text: 'Document your IP, use confidentiality agreements, consider trademarks for brand names, and consult a lawyer for patents if the idea is novel and defensible.' },
  { id: 9, title: 'What should go into customer contracts?', text: 'Define deliverables, payment terms, liability limits, termination conditions, and a clear dispute-resolution mechanism.' },
  { id: 10, title: 'How do I comply with data protection rules?', text: 'Map personal data you store, implement minimal retention, secure storage, and disclose processing in a privacy policy; follow local laws like GDPR where applicable.' },
  { id: 11, title: 'How to manage payroll and contractors?', text: 'Decide classification (employee vs contractor), set up payroll tools, withhold taxes for employees, and keep signed contractor agreements.' },
  { id: 12, title: 'How do I track receipts and expenses?', text: 'Use a simple expense app, categorize transactions monthly, and reconcile with bank statements to maintain clean books.' },
  { id: 13, title: 'How much cash runway do I need?', text: 'Aim for 60–90 days of runway for early-stage businesses; compute runway from your monthly net burn and increase buffer during uncertainty.' },
  { id: 14, title: 'How do I handle refunds and disputes?', text: 'Create a clear refund policy, document customer interactions, and resolve disputes promptly to protect reputation and reduce chargebacks.' },
  { id: 15, title: 'What insurance do I need?', text: 'Consider general liability, professional indemnity, cyber insurance, and employer liability based on your industry and risk profile.' },
  { id: 16, title: 'How do I keep ownership clean for investors?', text: 'Track equity, use simple cap table software, document share issuances and vesting schedules, and get legal advice before fundraising.' },
  { id: 17, title: 'How should I record loans and repayments?', text: 'Record principal and interest separately, create amortization schedules, and ensure cashflow forecasts include repayment timing.' },
  { id: 18, title: 'What compliance filings are recurring?', text: 'Identify payroll tax filings, sales tax returns, annual reports, and license renewals; set calendar reminders and automate filing where possible.' },
  { id: 19, title: 'How do I negotiate supplier payment terms?', text: 'Ask for net-30 or net-45 terms, request volume discounts, and consider early-pay discounts if cashflow allows.' },
  { id: 20, title: 'When should I consult a lawyer or accountant?', text: 'Seek advice for entity selection, contracts, IP protection, payroll setup, and before significant financings or exits.' }
];

async function main(){
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGODB_URI);
  const questionSchema = new mongoose.Schema({ id: Number, title: String, text: String }, { timestamps: true });
  const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
  console.log('Clearing existing questions...');
  await Question.deleteMany({});
  console.log('Inserting canonical questions...');
  const inserted = await Question.insertMany(questions.map(q=>({ id: q.id, title: q.title, text: q.text })));
  console.log('Inserted count:', inserted.length);
  await mongoose.disconnect();
}

main().catch(err=>{
  console.error('Error:', err && err.message || err);
  process.exit(1);
});
