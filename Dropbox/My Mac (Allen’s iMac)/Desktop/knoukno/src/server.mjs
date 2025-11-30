import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { graphqlHTTP } from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

// load env
dotenv.config();

// helpers to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- minimal schema to prove JSON works ---
const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    ping: { type: GraphQLString, resolve: () => 'pong' }
  }
});
const schema = new GraphQLSchema({ query: Query });

import authRouter from './routes/auth.prisma.mjs';
import answersRouter from './routes/answers.prisma.routes.mjs';
import questionsRouter from './routes/questions.routes.mjs';
import adminRouter from './routes/admin.mjs';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// mount routers
app.use('/auth', authRouter);
app.use('/api/answers', answersRouter);
app.use('/api', questionsRouter);
app.use('/admin', adminRouter);

// GraphQL (JSON only, no UI)
app.use('/graphql', graphqlHTTP({ schema, graphiql: false }));

// health
app.get('/healthz', (_req, res) => res.sendStatus(204));

const PORT = process.env.PORT || 5001;
const START_SERVER = process.env.START_SERVER === '1' || process.env.START_SERVER === 'true';
if (START_SERVER) {
  app.listen(PORT, () => {
    console.log(`[BOOT] http://127.0.0.1:${PORT}`);
  });
}

export default app;
