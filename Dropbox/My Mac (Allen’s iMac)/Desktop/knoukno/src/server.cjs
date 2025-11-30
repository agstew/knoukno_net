const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const answersRouter = require('./routes/answers.routes.cjs'); // require ONCE

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.get('/healthz', (_req, res) => res.sendStatus(204));
app.use('/api', answersRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`[BOOT] API http://127.0.0.1:${PORT}`));
