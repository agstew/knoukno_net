require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const {
  buildBusinessQuestionCatalog,
  buildAdminDailyEmails,
  buildUserJourneyEmails,
} = require('./services/businessAutomation');

const {
  User,
  Payment,
  Title,
  Login,
  Register,
  Print,
  Save,
  Question,
  Grade,
  Rated,
  Answers,
  Average,
  Delete,
  Email,
  adminCollections,
} = require('./models');

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/knoukno';
const jwtSecret = process.env.JWT_SECRET || 'change-me';
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const paypalCheckoutUrl = process.env.PAYPAL_CHECKOUT_URL || 'https://www.sandbox.paypal.com/checkoutnow';
const paypalApiBaseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';
const paypalClientId = String(process.env.PAYPAL_CLIENT_ID || '').trim();
const paypalClientSecret = String(process.env.PAYPAL_CLIENT_SECRET || '').trim();
const appOrigin = process.env.APP_ORIGIN || corsOrigin;
const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();

const plans = {
  member: {
    planId: 'member',
    planName: 'Member',
    amount: 39,
    plan: 'member',
  },
  pro: {
    planId: 'pro',
    planName: 'Pro',
    amount: 436,
    plan: 'pro',
  },
  memberCombined: {
    planId: 'memberCombined',
    planName: 'Member + Bonus',
    amount: 139,
    plan: 'member-combined',
  },
  proCombined: {
    planId: 'proCombined',
    planName: 'Pro + Bonus',
    amount: 536,
    plan: 'pro-combined',
  },
  memberBonus: {
    planId: 'memberBonus',
    planName: 'Member Bonus Only',
    amount: 100,
    plan: 'member-bonus',
  },
  proBonus: {
    planId: 'proBonus',
    planName: 'Pro Bonus Only',
    amount: 100,
    plan: 'pro-bonus',
  },
};

const businessQuestionCatalog = buildBusinessQuestionCatalog();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
});

function hasPayPalApiCredentials() {
  return Boolean(paypalClientId && paypalClientSecret);
}

async function getPayPalAccessToken() {
  const response = await fetch(`${paypalApiBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const payload = await response.json();

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || 'Failed to authenticate with PayPal.');
  }

  return payload.access_token;
}

async function createPayPalOrder(selectedPlan) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${paypalApiBaseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: selectedPlan.planId,
          description: selectedPlan.planName,
          amount: {
            currency_code: 'USD',
            value: selectedPlan.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${appOrigin}/plans`,
        cancel_url: `${appOrigin}/plans`,
        user_action: 'PAY_NOW',
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.id) {
    throw new Error(payload.message || 'Failed to create PayPal order.');
  }

  const approvalLink = (payload.links || []).find((item) => item.rel === 'approve');

  if (!approvalLink || !approvalLink.href) {
    throw new Error('PayPal approval link is missing.');
  }

  return {
    orderId: payload.id,
    approvalUrl: approvalLink.href,
  };
}

async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${paypalApiBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const issue = payload?.details?.[0]?.issue;
    if (issue === 'ORDER_ALREADY_CAPTURED') {
      return payload;
    }
    throw new Error(payload.message || 'Failed to capture PayPal order.');
  }

  return payload;
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user.publicId,
      email: user.email,
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

function serializeUser(user) {
  return {
    publicId: user.publicId,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
  };
}

function serializePayment(payment) {
  return {
    publicId: payment.publicId,
    planId: payment.planId,
    planName: payment.planName,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    orderId: payment.orderId,
    approvalUrl: payment.approvalUrl,
    createdAt: payment.createdAt,
  };
}

function serializeAdminItem(item) {
  return {
    ...item,
    _id: String(item._id),
  };
}

async function connectDb() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(mongoUri);
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization required.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ publicId: payload.sub }).lean();

    if (!user) {
      return res.status(401).json({ message: 'Account not found.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  return next();
}

async function recomputeAverage(userPublicId) {
  const [gradeItems, ratedItems] = await Promise.all([
    Grade.find({ userPublicId }).lean(),
    Rated.find({ userPublicId }).lean(),
  ]);

  const avgGrade = gradeItems.length
    ? gradeItems.reduce((sum, item) => sum + Number(item.value || 0), 0) / gradeItems.length
    : 0;
  const avgRated = ratedItems.length
    ? ratedItems.reduce((sum, item) => sum + Number(item.value || 0), 0) / ratedItems.length
    : 0;

  const average = await Average.findOneAndUpdate(
    { userPublicId },
    {
      title: 'average',
      value: {
        avgGrade,
        avgRated,
      },
      payload: {
        gradeCount: gradeItems.length,
        ratedCount: ratedItems.length,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return average;
}

async function ensureQuestionCatalogSeeded() {
  const existingCount = await Question.countDocuments({ 'payload.kind': 'catalog' });

  if (existingCount >= businessQuestionCatalog.length) {
    return existingCount;
  }

  await Question.deleteMany({ 'payload.kind': 'catalog' });
  await Question.insertMany(
    businessQuestionCatalog.map((item) => ({
      publicId: `catalog-${item.sequence}`,
      userPublicId: 'system-catalog',
      email: adminEmail || 'system@knoukno.net',
      title: item.title,
      value: item.question,
      payload: {
        kind: 'catalog',
        sequence: item.sequence,
        sector: item.sector,
        focus: item.focus,
        stage: item.stage,
      },
      status: 'active',
    }))
  );

  return businessQuestionCatalog.length;
}

async function ensureUserEmailSchedules(user) {
  const [existingAdminEmails, existingUserEmails] = await Promise.all([
    Email.countDocuments({
      title: 'admin-daily-ai',
      'payload.sourceUserPublicId': user.publicId,
    }),
    Email.countDocuments({
      title: 'user-growth-ai',
      'payload.sourceUserPublicId': user.publicId,
    }),
  ]);

  const emailDocs = [];

  if (!existingAdminEmails && adminEmail) {
    emailDocs.push(
      ...buildAdminDailyEmails(user, adminEmail).map((item) => ({
        publicId: uuidv4(),
        userPublicId: user.publicId,
        email: user.email,
        ...item,
      }))
    );
  }

  if (!existingUserEmails) {
    emailDocs.push(
      ...buildUserJourneyEmails(user).map((item) => ({
        publicId: uuidv4(),
        userPublicId: user.publicId,
        email: user.email,
        ...item,
      }))
    );
  }

  if (emailDocs.length) {
    await Email.insertMany(emailDocs);
  }

  return emailDocs.length;
}

app.get('/', (_req, res) => {
  res.render('status', { name: 'Kno U Kno API' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/config/paypal', (_req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    configured: hasPayPalApiCredentials(),
    plans: Object.values(plans),
  });
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();

  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered.' });
  }

  const userCount = await User.countDocuments();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    publicId: uuidv4(),
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    role: userCount === 0 || normalizedEmail === adminEmail ? 'admin' : 'user',
  });

  await Register.create({
    publicId: uuidv4(),
    userPublicId: user.publicId,
    email: user.email,
    name: user.name,
    title: 'register',
    payload: {
      role: user.role,
      plan: user.plan,
    },
  });

  await ensureUserEmailSchedules(user);

  return res.status(201).json({
    token: createToken(user),
    user: serializeUser(user),
  });
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  await Login.create({
    publicId: uuidv4(),
    userPublicId: user.publicId,
    email: user.email,
    title: 'login',
    ipAddress: req.ip,
  });

  return res.json({
    token: createToken(user),
    user: serializeUser(user),
  });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  return res.json({
    user: serializeUser(req.user),
  });
});

app.get('/api/payments', authMiddleware, async (req, res) => {
  const paymentItems = await Payment.find({ userPublicId: req.user.publicId }).sort({ createdAt: -1 }).lean();
  return res.json({ payments: paymentItems.map(serializePayment) });
});

app.get('/api/questions/catalog', authMiddleware, async (req, res) => {
  const offset = Math.max(Number(req.query.offset || 0), 0);
  const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 50);
  const items = businessQuestionCatalog.slice(offset, offset + limit);

  return res.json({
    total: businessQuestionCatalog.length,
    items,
  });
});

app.get('/api/admin/collections', authMiddleware, adminMiddleware, async (_req, res) => {
  const collectionItems = await Promise.all(
    Object.entries(adminCollections).map(async ([name, Model]) => ({
      name,
      count: await Model.countDocuments(),
      href: `/api/admin/collection/${name}`,
    }))
  );

  return res.json({ collections: collectionItems });
});

app.get('/api/admin/collection/:name', authMiddleware, adminMiddleware, async (req, res) => {
  const modelName = String(req.params.name || '').toLowerCase();
  const Model = adminCollections[modelName];

  if (!Model) {
    return res.status(404).json({ message: 'Collection not found.' });
  }

  const items = await Model.find().sort({ createdAt: -1 }).limit(50).lean();
  const count = await Model.countDocuments();

  return res.json({
    collection: modelName,
    count,
    items: items.map(serializeAdminItem),
  });
});

app.post('/api/admin/questions/seed', authMiddleware, adminMiddleware, async (_req, res) => {
  const count = await ensureQuestionCatalogSeeded();
  return res.json({
    collection: 'question',
    count,
  });
});

app.post('/api/admin/email-schedules/backfill', authMiddleware, adminMiddleware, async (_req, res) => {
  const users = await User.find().lean();
  let scheduledCount = 0;

  for (const user of users) {
    scheduledCount += await ensureUserEmailSchedules(user);
  }

  return res.json({
    collection: 'email',
    scheduledCount,
    userCount: users.length,
  });
});

app.get('/api/workspace', authMiddleware, async (req, res) => {
  const [titles, questions, answersItems, grades, ratings, saves, prints, emails, averages] = await Promise.all([
    Title.find({ userPublicId: req.user.publicId }).sort({ createdAt: -1 }).limit(5).lean(),
    Question.find({ userPublicId: req.user.publicId }).sort({ createdAt: -1 }).limit(5).lean(),
    Answers.find({ userPublicId: req.user.publicId }).sort({ createdAt: -1 }).limit(5).lean(),
    Grade.find({ userPublicId: req.user.publicId }).sort({ createdAt: -1 }).limit(5).lean(),
    Rated.find({ userPublicId: req.user.publicId }).sort({ createdAt: -1 }).limit(5).lean(),
    Save.find({ userPublicId: req.user.publicId }).sort({ createdAt: -1 }).limit(5).lean(),
    Print.find({ userPublicId: req.user.publicId }).sort({ createdAt: -1 }).limit(5).lean(),
    Email.find({ userPublicId: req.user.publicId }).sort({ createdAt: -1 }).limit(5).lean(),
    Average.findOne({ userPublicId: req.user.publicId }).lean(),
  ]);

  return res.json({
    title: titles,
    question: questions,
    answers: answersItems,
    grade: grades,
    rated: ratings,
    save: saves,
    print: prints,
    email: emails,
    average: averages,
  });
});

app.post('/api/workspace/save', authMiddleware, async (req, res) => {
  const { title, question, answer, grade, rated } = req.body || {};

  if (!title || !question || !answer) {
    return res.status(400).json({ message: 'Title, question, and answer are required.' });
  }

  const recordId = uuidv4();
  const common = {
    userPublicId: req.user.publicId,
    email: req.user.email,
  };

  const [titleItem, questionItem, answerItem, gradeItem, ratedItem] = await Promise.all([
    Title.create({
      publicId: uuidv4(),
      ...common,
      title,
      value: title,
    }),
    Question.create({
      publicId: recordId,
      ...common,
      title,
      value: question,
      payload: { question },
    }),
    Answers.create({
      publicId: recordId,
      ...common,
      title,
      value: answer,
      payload: { answer },
    }),
    Grade.create({
      publicId: recordId,
      ...common,
      title,
      value: Number(grade || 0),
    }),
    Rated.create({
      publicId: recordId,
      ...common,
      title,
      value: Number(rated || 0),
    }),
  ]);

  const saveItem = await Save.create({
    publicId: uuidv4(),
    ...common,
    title,
    payload: {
      recordId,
      question,
      answer,
      grade: Number(grade || 0),
      rated: Number(rated || 0),
    },
  });

  const averageItem = await recomputeAverage(req.user.publicId);

  return res.status(201).json({
    items: {
      title: serializeAdminItem(titleItem.toObject()),
      question: serializeAdminItem(questionItem.toObject()),
      answers: serializeAdminItem(answerItem.toObject()),
      grade: serializeAdminItem(gradeItem.toObject()),
      rated: serializeAdminItem(ratedItem.toObject()),
      save: serializeAdminItem(saveItem.toObject()),
      average: serializeAdminItem(averageItem.toObject()),
    },
  });
});

app.post('/api/workspace/print', authMiddleware, async (req, res) => {
  const { title, question, answer } = req.body || {};

  const printItem = await Print.create({
    publicId: uuidv4(),
    userPublicId: req.user.publicId,
    email: req.user.email,
    title: title || 'print',
    payload: {
      question,
      answer,
    },
  });

  return res.status(201).json({ item: serializeAdminItem(printItem.toObject()) });
});

app.post('/api/workspace/email', authMiddleware, async (req, res) => {
  const { title, to, message } = req.body || {};

  if (!to || !message) {
    return res.status(400).json({ message: 'Recipient email and message are required.' });
  }

  const emailItem = await Email.create({
    publicId: uuidv4(),
    userPublicId: req.user.publicId,
    email: req.user.email,
    title: title || 'email',
    payload: {
      to,
      message,
    },
    value: to,
    status: 'scheduled',
  });

  return res.status(201).json({ item: serializeAdminItem(emailItem.toObject()) });
});

app.post('/api/workspace/delete', authMiddleware, async (req, res) => {
  return res.status(403).json({ message: 'Delete is disabled.' });
});

app.post('/api/payments/create-checkout', authMiddleware, async (req, res) => {
  const { planId } = req.body || {};
  const selectedPlan = plans[planId];

  if (!selectedPlan) {
    return res.status(400).json({ message: 'Plan not found.' });
  }

  let orderId;
  let approvalUrl;

  if (hasPayPalApiCredentials()) {
    const order = await createPayPalOrder(selectedPlan);
    orderId = order.orderId;
    approvalUrl = order.approvalUrl;
  } else {
    orderId = uuidv4();
    approvalUrl = `${paypalCheckoutUrl}?token=${orderId}`;
  }

  const payment = await Payment.create({
    publicId: uuidv4(),
    userPublicId: req.user.publicId,
    email: req.user.email,
    planId: selectedPlan.planId,
    planName: selectedPlan.planName,
    amount: selectedPlan.amount,
    orderId,
    approvalUrl,
  });

  return res.status(201).json({ payment: serializePayment(payment) });
});

app.post('/api/payments/confirm', authMiddleware, async (req, res) => {
  const { orderId } = req.body || {};

  if (!orderId) {
    return res.status(400).json({ message: 'Order id is required.' });
  }

  const payment = await Payment.findOne({ orderId, userPublicId: req.user.publicId });

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found.' });
  }

  if (hasPayPalApiCredentials()) {
    await capturePayPalOrder(orderId);
  }

  payment.status = 'completed';
  await payment.save();

  const selectedPlan = plans[payment.planId];
  const user = await User.findOneAndUpdate(
    { publicId: req.user.publicId },
    { plan: selectedPlan ? selectedPlan.plan : req.user.plan },
    { new: true }
  );

  return res.json({
    payment: serializePayment(payment),
    user: serializeUser(user),
  });
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ message: error.message || 'Server error.' });
});

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });
