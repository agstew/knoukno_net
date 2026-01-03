require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SEED_TOKEN = process.env.SEED_TOKEN || null;

// MongoDB connection (optional). Uses MONGODB_URI or defaults to local.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kno-u-kno';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Mongoose: connected to ${MONGODB_URI}`))
  .catch(err => console.warn('Mongoose connection error:', err.message));

// Define Question model
const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: String,
  text: String
}, { timestamps: true });
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/public', express.static(path.join(__dirname, 'public')));

// Sample questions focused on Money & Law — expanded for pagination
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

// Pricing tiers per your spec
const tiers = [
  {
    id: 'free',
    name: 'Free',
    questions: 5,
    duration: '3 days',
    features: ['Save page', 'Print page'],
    price: 0
  },
  {
    id: 'member',
    name: 'Member',
    questions: 50,
    features: ['Print page', 'Save page', 'Grade page', 'Rate page', 'Average page'],
    price: 39.00,
    oldPrice: 49.00,
    discount: '20%'
  },
  {
    id: 'pro',
    name: 'Pro',
    questions: 75,
    features: ['Print page', 'Save page', 'Grade page', 'Rate page', 'Average page'],
    price: 436.00,
    oldPrice: 675.00,
    discount: '35%'
  }
];

app.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const perPage = 5;
  const start = (page - 1) * perPage;
  const paginated = questions.slice(start, start + perPage);
  const totalPages = Math.ceil(questions.length / perPage);
  // Featured guidance — 350 words focused on Money & Law for small business owners
  const featuredGuidance = `Money and legal foundations determine whether a small business survives and scales. Begin by choosing the right legal entity: assess liability exposure, tax implications, and administrative burden when choosing between sole proprietorship, LLC, or corporation. Document ownership and decision rights clearly to prevent future disputes. Keep business and personal finances strictly separate by opening dedicated bank accounts and credit lines.

Cashflow management is the daily work of running a business. Create a rolling 90-day cash forecast with weekly granularity, listing all expected inflows and outflows. Build conservative estimates for revenue and include timing assumptions for customer payments and supplier invoices. Use payment terms to your advantage: prefer upfront or shorter terms where possible, and offer discounts for prepayment. Implement straightforward invoicing with payment links and follow up on late payments immediately; frictionless payment methods reduce receivable days and improve runway.

Understand core taxes and filings early: payroll taxes, sales tax, and income tax obligations vary by jurisdiction and can carry penalties if missed. Set aside a reliable percentage of revenue in a separate account for taxes, and use accounting software or an accountant to automate filings. Insurance and basic contracts reduce operational risk — have clear service agreements, liability limits, and confidentiality clauses with clients and contractors.

Cost control matters: audit recurring subscriptions, negotiate supplier terms, and only hire for roles that move the business forward. Track gross margin by product or service; if an offering loses money at scale, reprice or discontinue it. For financing events, keep a clean cap table and accurate financial records; these are essential for investor diligence and future fundraising.

Lastly, know when to get professional advice. Consult an accountant for tax structure and payroll setup, and a lawyer for contracts, IP protection, and entity formation. Simple, documented processes for bookkeeping, invoicing, and compliance create stability — and stability gives you the space to focus on growth.`;

  // convert paragraphs to simple HTML for rendering
  const featuredHtml = featuredGuidance
    .split('\n\n')
    .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

  // If MongoDB is connected, load questions from DB with pagination
  const useDb = mongoose.connection && mongoose.connection.readyState === 1;
  if (useDb) {
    (async () => {
      try {
        const total = await Question.countDocuments().exec();
        const docs = await Question.find().sort({ id: 1 }).skip(start).limit(perPage).lean().exec();
        const totalPagesDb = Math.max(1, Math.ceil(total / perPage));
        return res.render('index', {
          title: 'Kno U Kno',
          description: 'How to get a business working',
          text: 'Word 350 text. How to get a business working — concise guidance and starter questions.',
          tiers,
          questions: docs,
          page,
          totalPages: totalPagesDb,
          featuredHtml
        });
      } catch (e) {
        console.error('DB read error:', e);
        // fallback to in-memory
        return res.render('index', {
          title: 'Kno U Kno',
          description: 'How to get a business working',
          text: 'Word 350 text. How to get a business working — concise guidance and starter questions.',
          tiers,
          questions: paginated,
          page,
          totalPages,
          featuredHtml
        });
      }
    })();
  } else {
    // No DB — render using in-memory questions
    res.render('index', {
      title: 'Kno U Kno',
      description: 'How to get a business working',
      text: 'Word 350 text. How to get a business working — concise guidance and starter questions.',
      tiers,
      questions: paginated,
      page,
      totalPages,
      featuredHtml
    });
  }
});

app.get('/question/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  // Try DB first, then fallback to in-memory
  const useDb = mongoose.connection && mongoose.connection.readyState === 1;
  if (useDb) {
    Question.findOne({ id }).lean().exec()
      .then(q => {
        if (!q) return res.status(404).send('Question not found');
        res.render('question', { title: q.title, q });
      })
      .catch(err => {
        console.error('DB error:', err);
        const q = questions.find(x => x.id === id);
        if (!q) return res.status(404).send('Question not found');
        res.render('question', { title: q.title, q });
      });
  } else {
    const q = questions.find(x => x.id === id);
    if (!q) return res.status(404).send('Question not found');
    res.render('question', { title: q.title, q });
  }
});

app.get('/about', (req, res) => {
  res.render('index', { title: 'About', description: 'About Kno U Kno', text: 'This is a demo frontend for the Kno U Kno site. Use the nav to explore.' , tiers, questions: [], page:1, totalPages:1});
});

app.get('/registered', (req, res) => {
  res.render('index', { title: 'Registered', description: 'Thanks for registering', text: 'You are registered. Check your email for next steps.', tiers, questions: [], page:1, totalPages:1});
});

app.get('/login', (req, res) => {
  res.render('index', { title: 'Login (JWT)', description: 'Login with JWT', text: 'This link would start an authentication flow that returns a JWT.', tiers, questions: [], page:1, totalPages:1});
});

// Seed endpoint: insert sample questions into MongoDB (idempotent)
app.get('/seed-questions', async (req, res) => {
  try {
    // If a SEED_TOKEN is configured, require the x-admin-token header
    if (SEED_TOKEN) {
      const token = req.get('x-admin-token');
      if (!token || token !== SEED_TOKEN) {
        console.warn('Unauthorized seed attempt from', req.ip);
        return res.status(401).send('Unauthorized');
      }
    } else {
      console.warn('Warning: SEED_TOKEN not set — /seed-questions is publicly callable');
    }

    const existing = await Question.countDocuments().exec();
    if (existing > 0) return res.send(`DB already has ${existing} questions`);
    await Question.insertMany(questions.map(q => ({ id: q.id, title: q.title, text: q.text })));
    return res.send(`Inserted ${questions.length} questions`);
  } catch (e) {
    console.error('Seed error:', e);
    return res.status(500).send('Seed failed');
  }
});

// Health endpoint for readiness checks
app.get('/health', (req, res) => {
  const dbState = mongoose.connection && mongoose.connection.readyState;
  res.json({ status: 'ok', db: dbState === 1 ? 'connected' : 'disconnected' });
});

// Start server with graceful handling of EADDRINUSE.
const desiredPort = process.env.PORT ? parseInt(process.env.PORT, 10) : PORT;
const server = app.listen(desiredPort, () => {
  const actual = server.address() && server.address().port;
  console.log(`Kno U Kno frontend running on http://localhost:${actual}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    if (!process.env.PORT) {
      // If the user didn't request a specific port, fall back to an ephemeral port
      console.warn(`Port ${desiredPort} in use — attempting to listen on an available port instead.`);
      const fallback = app.listen(0, () => {
        const p = fallback.address() && fallback.address().port;
        console.log(`Listening on fallback port http://localhost:${p}`);
      });
      fallback.on('error', (e) => {
        console.error('Failed to start on fallback port:', e);
        process.exit(1);
      });
    } else {
      console.error(`Port ${desiredPort} already in use. Set a different PORT or stop the process using it.`);
      process.exit(1);
    }
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
function shutdown() {
  console.log('Shutting down server...');
  try {
    server.close(async () => {
      try {
        await mongoose.disconnect();
        console.log('Mongoose disconnected');
        process.exit(0);
      } catch (e) {
        console.error('Error during mongoose disconnect', e);
        process.exit(1);
      }
    });
  } catch (e) {
    console.error('Error during shutdown', e);
    process.exit(1);
  }
  // force exit after 10s
  setTimeout(() => {
    console.error('Forcing exit');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
