const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
let MongoMemoryServer;
try {
	MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (e) {
	MongoMemoryServer = null;
}

const csurf = require('csurf');
const os = require('os');
// Prometheus client for metrics
const promClient = require('prom-client');

const authMiddleware = require('./middleware/auth');
const UserModel = require('./models/user');
const AnswerModel = require('./models/answer');

const app = express();

// Basic middleware
app.use(bodyParser.json());
app.use(cookieParser());

// Request logging middleware (helpful when debugging timeouts/hangs)
app.use((req, res, next) => {
	const start = Date.now();
	// Optionally enable verbose header logging by setting ?debug=1 or header X-Debug-Verbose=1
	const verbose = req.query && req.query.debug === '1' || req.get('X-Debug-Verbose') === '1';
	if (verbose) {
		console.log('[VERBOSE REQUEST] %s %s headers=%o', req.method, req.originalUrl, req.headers);
	}
	res.on('finish', () => {
		const ms = Date.now() - start;
		console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
	});
	next();
});

// Slow request logger: warn if a request takes longer than this threshold (ms)
const SLOW_REQUEST_MS = process.env.SLOW_REQUEST_MS ? parseInt(process.env.SLOW_REQUEST_MS, 10) : 500;
app.use((req, res, next) => {
	const start = Date.now();
	res.on('finish', () => {
		const ms = Date.now() - start;
		if (ms >= SLOW_REQUEST_MS) {
			console.warn(`[SLOW] ${req.method} ${req.originalUrl} ${res.statusCode} took ${ms}ms`);
		}
	});
	next();
});

// Prometheus metrics setup
const collectDefault = promClient.collectDefaultMetrics;
collectDefault({ prefix: 'kno_' });

const httpRequestsTotal = new promClient.Counter({
	name: 'kno_http_requests_total',
	help: 'Total HTTP requests',
	labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new promClient.Histogram({
	name: 'kno_http_request_duration_seconds',
	help: 'Request duration in seconds',
	labelNames: ['method', 'route', 'status'],
	buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

const slowRequests = new promClient.Counter({
	name: 'kno_slow_requests_total',
	help: 'Total requests exceeding slow threshold',
	labelNames: ['method', 'route', 'status']
});

const dbConnected = new promClient.Gauge({
	name: 'kno_db_connected',
	help: 'Whether the DB is connected (1) or not (0)'
});

// Instrument requests for Prometheus
app.use((req, res, next) => {
	const end = httpRequestDuration.startTimer();
	res.on('finish', () => {
		const route = req.route && req.route.path ? req.route.path : req.path || 'unknown';
		const labels = { method: req.method, route, status: String(res.statusCode) };
		httpRequestsTotal.inc(labels, 1);
		end(labels);
		if (res.getHeader && res.getHeader('X-Response-Time')) {
			// no-op; kept for compatibility
		}
	});
	next();
});

// Simple CORS handling for local development so the preview served
// from a different port (e.g. http://localhost:5000) can call the API
// with credentials. In production, configure stricter origins.
app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (origin && origin.startsWith('http://localhost')) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, Authorization');
	}
	if (req.method === 'OPTIONS') return res.sendStatus(204);
	next();
});

// CSRF protection using double-submit cookie approach
// We configure csurf to use cookies so the server doesn't need to hold session state.
const csrfProtection = csurf({ cookie: true });

// expose a simple endpoint to fetch CSRF token for single-page frontends
app.get('/auth/csrf-token', csrfProtection, (req, res) => {
	res.json({ csrfToken: req.csrfToken() });
});

// Lightweight health endpoint for monitoring and debugging
app.get('/health', (req, res) => {
	const dbState = (typeof mongoose !== 'undefined' && mongoose.connection) ? mongoose.connection.readyState : null;
	res.json({
		status: 'ok',
		uptime: process.uptime(),
		pid: process.pid,
		env: process.env.NODE_ENV || 'development',
		dbState
	});
});

// Metrics endpoint: useful for lightweight monitoring or CI checks
app.get('/metrics', async (req, res) => {
	try {
		const mem = process.memoryUsage();
		const load = os.loadavg();
		const dbState = (typeof mongoose !== 'undefined' && mongoose.connection) ? mongoose.connection.readyState : null;
		const routes = [];
		try {
			app._router.stack.forEach((r) => {
				if (r.route && r.route.path) {
					routes.push({ path: r.route.path, methods: Object.keys(r.route.methods) });
				} else if (r.name === 'router' && r.handle && r.handle.stack) {
					r.handle.stack.forEach((layer) => {
						if (layer.route && layer.route.path) {
							routes.push({ path: layer.route.path, methods: Object.keys(layer.route.methods) });
						}
					});
				}
			});
		} catch (e) {
			// route inspection best-effort
		}

		res.json({
			status: 'ok',
			pid: process.pid,
			uptime: process.uptime(),
			env: process.env.NODE_ENV || 'development',
			node: process.version,
			memory: mem,
			loadavg: load,
			dbState,
			routeCount: routes.length,
			routes: routes.slice(0, 30),
			timestamp: Date.now()
		});
	} catch (err) {
		console.error('Error in /metrics:', err);
		res.status(500).json({ error: 'failed to collect metrics' });
	}
});

// Readiness endpoint: performs a lightweight DB ping (read-only) to verify readiness
app.get('/ready', async (req, res) => {
	try {
		if (mongoose && mongoose.connection && mongoose.connection.readyState) {
			// try a lightweight ping against the underlying driver if available
			try {
				const admin = mongoose.connection.db.admin();
				const result = await admin.ping();
				if (result && (result.ok === 1 || result.ok === 1.0)) {
					return res.json({ ready: true, db: true });
				}
			} catch (e) {
				// fallback: check readyState only
				console.warn('DB ping failed in /ready:', e && e.message);
				return res.json({ ready: true, db: 'unknown' });
			}
		}
		// if no mongoose or connection not ready
		res.status(503).json({ ready: false, db: false });
	} catch (err) {
		console.error('Error in /ready:', err);
		res.status(500).json({ ready: false, error: err.message });
	}
});

// Prometheus exposition endpoint (text format)
app.get('/metrics/prom', async (req, res) => {
	try {
		// update live gauge
		try {
			dbConnected.set((mongoose && mongoose.connection && mongoose.connection.readyState) ? 1 : 0);
		} catch (e) {
			dbConnected.set(0);
		}
		res.set('Content-Type', promClient.register.contentType);
		res.send(await promClient.register.metrics());
	} catch (err) {
		console.error('Error in /metrics/prom:', err);
		res.status(500).send(err.message || 'metrics error');
	}
});

// Global error handlers to surface unhandled rejections and exceptions in logs
process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
	// keep process alive for nodemon to restart; do not swallow in production
	process.exit(1);
});

// Inline self-delete route (convenience and backup for the mounted auth/delete route)
app.post('/auth/delete-self', csrfProtection, authMiddleware, async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });

		await AnswerModel.deleteMany({ userId });
		await UserModel.findByIdAndDelete(userId);
		res.clearCookie('token');
		res.json({ message: 'User and related answers deleted (inline)' });
	} catch (err) {
		console.error('Inline delete-self error:', err);
		res.status(500).json({ error: 'Failed to delete user (inline)' });
	}
});

// Explicit inline delete endpoint with unique path for tests
app.post('/auth/delete-self-inline', csrfProtection, authMiddleware, async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });

		await AnswerModel.deleteMany({ userId });
		await UserModel.findByIdAndDelete(userId);
		res.clearCookie('token');
		res.json({ message: 'User and related answers deleted (inline-alt)' });
	} catch (err) {
		console.error('Inline delete-self-alt error:', err);
		res.status(500).json({ error: 'Failed to delete user (inline-alt)' });
	}
});

// Import auth routes
const authRegister = require('./auth/register');
const authLogin = require('./auth/login');
const authDelete = require('./auth/delete');

// Import the questions API
const questionsApi = require('./api/questions');
// Import the answers API
const answersApi = require('./api/answers');
// Import the dashboard API
const dashboardApi = require('./api/dashboard');

// Mount routes (apply csrfProtection to state-changing routes via middleware inside handlers)
// For simplicity we apply csrfProtection globally to all routes after this point. GETs remain usable,
// and POST/PUT/DELETE will require the `X-CSRF-Token` header or `_csrf` body/query param.
app.use(csrfProtection);
app.use('/auth/register', authRegister);
app.use('/auth/login', authLogin);
app.use('/auth/delete-self', authDelete);
app.use('/api/questions', questionsApi);
app.use('/api/answers', answersApi);
app.use('/api/dashboard', dashboardApi);

// CSRF error handler
app.use((err, req, res, next) => {
	if (err && err.code === 'EBADCSRFTOKEN') {
		return res.status(403).json({ error: 'Invalid CSRF token' });
	}
	next(err);
});

// Connect to MongoDB (use MONGO_URI or spin up in-memory MongoDB for tests)
const MONGO_URI = process.env.MONGO_URI || null;

async function start() {
	try {
		let mongoUri = MONGO_URI;
		if (!mongoUri) {
			if (!MongoMemoryServer) {
				console.warn('No MONGO_URI and mongodb-memory-server not available. Set MONGO_URI to connect to a database.');
			} else {
				const mem = await MongoMemoryServer.create();
				mongoUri = mem.getUri();
				console.log('Started in-memory MongoDB for testing:', mongoUri);
			}
		}

		if (mongoUri) {
			mongoose.set('strictQuery', false);
			await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
			console.log('Connected to MongoDB');
		} else {
			console.warn('Running without a MongoDB connection. Mongoose model operations will fail.');
		}

		const PORT = process.env.PORT || 3000;

		// Print registered routes (helpful for debugging in CI/test runs)
		function listRoutes() {
			try {
				console.log('Registered routes:');
				app._router.stack.forEach((r) => {
					if (r.route && r.route.path) {
						const methods = Object.keys(r.route.methods).join(',').toUpperCase();
						console.log(`${methods} ${r.route.path}`);
					} else if (r.name === 'router' && r.handle && r.handle.stack) {
						// nested router
						r.handle.stack.forEach((layer) => {
							if (layer.route && layer.route.path) {
								const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
								console.log(`${methods} ${layer.route.path}`);
							}
						});
					}
				});
			} catch (e) {
				console.warn('Could not list routes:', e && e.message ? e.message : e);
			}
		}

		// Control verbose route-listing and startup logging via environment variables.
		const isProd = process.env.NODE_ENV === 'production';
		const showRoutesFlag = String(process.env.SHOW_ROUTES || '').toLowerCase();
		const forceShowRoutes = showRoutesFlag === '1' || showRoutesFlag === 'true' || showRoutesFlag === 'yes';

		if (!isProd || forceShowRoutes) {
			// In development or when explicitly requested, print routes and the actual port.
			listRoutes();
			const serverInstance = app.listen(PORT, () => {
				const actualPort = serverInstance.address() && serverInstance.address().port;
				console.log(`Backend listening on port ${actualPort}`);
			});
		} else {
			// In normal production, keep startup logging minimal to avoid leaking internal route structure.
			app.listen(PORT);
		}
	} catch (err) {
		console.error('Failed to start server:', err);
		process.exit(1);
	}
}

start();
