// src/server.js  (ESM)
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';

// Routers: import ONCE (no require anywhere)
import answersRouter from './routes/answers.routes.js';
// import authRouter from './routes/auth.js';           // if you have it
// import questionsRouter from './routes/questions.routes.js';
// import payRouter from './routes/pay.js';

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.get('/healthz', (_req, res) => res.sendStatus(204));

// Mount routers ONCE
app.use('/api', answersRouter);
// app.use('/auth', authRouter);
// app.use('/api', questionsRouter);
// app.use('/pay', payRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[BOOT] API listening on http://127.0.0.1:${PORT}`);
});
