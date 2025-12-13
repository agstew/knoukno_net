
const rateLimit = require('express-rate-limit');
const adminMiddleware = require('./middleware/admin');
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
const promClient = require('prom-client');
const authMiddleware = require('./middleware/auth');
const UserModel = require('./models/user');
const AnswerModel = require('./models/answer');
const AuditModel = require('./models/audit');
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
const app = express();
const bcrypt = require('bcryptjs');

// Rate limiting for auth endpoints (must be after app is defined)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many attempts, please try again later.' }
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Admin dashboard (RBAC protected)
app.get('/admin', authMiddleware, adminMiddleware, (req, res) => {
	res.render('admin', {
		user: req.user,
		error: req.flash('error'),
		success: req.flash('success')
	});
});

// Admin email stats: show breakdown of kno_email_sends_total by label
app.get('/admin/email-stats', authMiddleware, adminMiddleware, async (req, res) => {
	try {
		const metrics = await promClient.register.getMetricsAsJSON();
		const emailMetric = metrics.find(m => m.name === 'kno_email_sends_total');
		res.render('email_stats', { user: req.user, metric: emailMetric, error: req.flash('error'), success: req.flash('success') });
	} catch (e) {
		console.error('Failed to load email metrics:', e && e.message);
		req.flash('error', 'Unable to load email metrics');
		res.redirect('/admin');
	}
});




// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets (if any) from /public
app.use(express.static(path.join(__dirname, 'public')));
// Basic middleware: JSON body parsing and cookie parsing must be registered
// before any CSRF-protected routes so `csurf` can read/write cookies.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session and flash middleware for user-friendly messages
app.use(session({
	secret: process.env.SESSION_SECRET || 'CHANGE_ME_SESSION',
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));
app.use(flash());

// Global middleware: clear auth `token` cookie automatically when a 401 is returned.
// This prevents clients from holding onto stale/invalid JWT cookies and avoids
// repeated 401 loops in SPAs or automated checks.
app.use((req, res, next) => {
	const originalStatus = res.status.bind(res);
	let pendingStatus = null;
	res.status = function(code) {
		pendingStatus = code;
		return originalStatus(code);
	};

	// Helper to clear auth cookies once (dedupe using a flag on res.locals)
	function clearAuthCookiesOnce() {
		try {
			if (res.locals && res.locals._authCookiesCleared) return;
			const names = ['token', 'auth_token', 'jwt'];
			for (const n of names) {
				try { res.clearCookie(n); } catch (e) { /* ignore */ }
			}
			if (res.locals) res.locals._authCookiesCleared = true;
			// Record an audit entry for the automatic cookie clear
			try {
				const reason = (res.locals && res.locals.clearTokenReason) || (pendingStatus ? String(pendingStatus) : 'unknown');
				const meta = { reason, route: req.originalUrl, ip: req.ip };
				// non-blocking create, best-effort
				if (typeof AuditModel !== 'undefined' && AuditModel && AuditModel.create) {
					AuditModel.create({ action: 'clear_token', adminId: (req.user && req.user.id) || null, targetEmail: null, meta }).catch(() => {});
				}
			} catch (e) {
				// ignore
			}
		} catch (e) {
			// ignore
		}
	}

	const shouldClear = () => (pendingStatus === 401 || pendingStatus === 403) || res.statusCode === 401 || res.statusCode === 403 || (res.locals && res.locals.clearToken);

	const originalJson = res.json.bind(res);
	res.json = function(body) {
		if (shouldClear()) clearAuthCookiesOnce();
		return originalJson(body);
	};

	const originalSend = res.send.bind(res);
	res.send = function(body) {
		if (shouldClear()) clearAuthCookiesOnce();
		return originalSend(body);
	};

	next();
});

// EJS view routes for authentication and dashboard
app.get('/login', (req, res) => {
	res.render('login', {
		error: req.flash('error'),
		success: req.flash('success')
	});
});

// Root: redirect to dashboard when authenticated, otherwise to login
app.get('/', async (req, res) => {
	// Custom root behavior: validate JWT cookie server-side and redirect to
	// /dashboard when valid. If no valid token, render a simple landing page.
	try {
		const token = req.cookies && req.cookies.token;
		if (token) {
			try {
				const jwtLib = require('jsonwebtoken');
				const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME';
				const payload = jwtLib.verify(token, JWT_SECRET);
				// verify the user still exists in the DB (reasonable safety check)
				if (payload && payload.id) {
					const u = await UserModel.findById(payload.id).select('email isAdmin isVerified').lean();
					if (u) {
						// require email verification before allowing dashboard access
						if (!u.isVerified) {
							req.flash('error', 'Please verify your email before signing in.');
							// mark that token should be cleared; global middleware will clear
							if (!res.locals) res.locals = {};
							res.locals.clearToken = true;
							return res.render('index', { user: null, error: req.flash('error'), success: req.flash('success'), env: process.env.NODE_ENV || 'development', uptime: process.uptime() });
						}
						return res.redirect('/dashboard');
					}
				}
			} catch (err) {
				// token invalid or verification failed — mark token for clearing for safety
				try {
					if (!res.locals) res.locals = {};
					res.locals.clearToken = true;
					res.locals.clearTokenReason = (err && err.name) || 'token_error';
				} catch (noop) {}
				console.debug && console.debug('Root: token verify failed', err && err.message);
			}
		}
	} catch (ex) {
		console.warn('Root handler error:', ex && ex.message);
	}

	// Render a small landing page for unauthenticated requests
	return res.render('index', {
		user: null,
		error: req.flash('error'),
		success: req.flash('success'),
		env: process.env.NODE_ENV || 'development',
		uptime: process.uptime()
	});
});


// Forgot password and reset password views handled by /auth/forgot router
const forgotRouter = require('./auth/forgot');
app.use('/auth/forgot', forgotRouter);
app.use('/auth/reset', forgotRouter);

// Dashboard route (protected)
app.get('/dashboard', authMiddleware, (req, res) => {
	res.render('dashboard', {
		user: req.user,
		error: req.flash('error'),
		success: req.flash('success')
	});
});

// Generic error page
app.get('/error', (req, res) => {
	const message = req.query.message || 'An error occurred.';
	res.render('error', { message });
});

// Basic middleware (already registered above)

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

// Additional Prometheus metrics for security and errors
const loginFailures = new promClient.Counter({
	name: 'kno_login_failures_total',
	help: 'Total failed login attempts',
	labelNames: ['email']
});
const registerFailures = new promClient.Counter({
	name: 'kno_register_failures_total',
	help: 'Total failed registration attempts',
	labelNames: ['email']
});
const errorEvents = new promClient.Counter({
	name: 'kno_error_events_total',
	help: 'Total error events',
	labelNames: ['route', 'type']
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
// Provide explicit cookie options so local development over plain HTTP works
// (Secure=false) while production remains secure. Also set a sane SameSite
// policy to allow same-site POSTs from the SPA.
// Use a readable cookie name so client-side code (or dev tools) can inspect
// the CSRF token when needed. In development we intentionally make the
// cookie readable (`httpOnly: false`) so tests and debugging tools can
// access it — production keeps the cookie secure.
const csrfCookieOptions = {
	key: 'XSRF-TOKEN',                // cookie name
	// Make the cookie HttpOnly in production for security; keep it readable
	// in development to aid debugging and E2E tests.
	httpOnly: (process.env.NODE_ENV === 'production'),
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax'
};
const csrfProtection = csurf({ cookie: csrfCookieOptions });

// expose a simple endpoint to fetch CSRF token for single-page frontends
app.get('/auth/csrf-token', csrfProtection, (req, res) => {
	res.json({ csrfToken: req.csrfToken() });
});

// Admin users management: list users and delete (admin only)
app.get('/admin/users', authMiddleware, adminMiddleware, (req, res, next) => {
	// invoke csrfProtection for this GET so we can render a token for forms
	csrfProtection(req, res, async () => {
		try {
			const page = Math.max(1, parseInt(req.query.page, 10) || 1);
			const per = 20;
			const total = await UserModel.countDocuments();
			const users = await UserModel.find()
				.sort({ createdAt: -1 })
				.skip((page - 1) * per)
				.limit(per)
				.select('email createdAt')
				.lean();
					res.render('admin_users', {
						user: req.user,
						users,
						page,
						per,
						total,
						csrfToken: req.csrfToken(),
						error: req.flash('error'),
						success: req.flash('success'),
						devQuick: Boolean(req.cookies && req.cookies.dev_quick)
					});
		} catch (err) {
			next(err);
		}
	});
});

app.post('/admin/users/delete', csrfProtection, authMiddleware, adminMiddleware, async (req, res) => {
	try {
		const email = (req.body && req.body.email) ? String(req.body.email).toLowerCase().trim() : null;
		if (!email) {
			req.flash('error', 'No email provided');
			return res.redirect('/admin/users');
		}
		const user = await UserModel.findOne({ email });
		if (!user) {
			req.flash('error', 'User not found');
			return res.redirect('/admin/users');
		}
		await AnswerModel.deleteMany({ userId: user._id });
		await UserModel.findByIdAndDelete(user._id);
		// Record audit trail for admin deletion
		try {
			await AuditModel.create({ action: 'delete_user', adminId: req.user && req.user.id, targetEmail: email, meta: { ip: req.ip } });
		} catch (auditErr) {
			console.warn('Failed to record audit entry:', auditErr && auditErr.message);
		}
		req.flash('success', `User and related answers deleted: ${email}`);
		res.redirect('/admin/users');
	} catch (err) {
		console.error('Admin delete user error:', err);
		req.flash('error', 'Failed to delete user');
		res.redirect('/admin/users');
	}
});

// Admin audit trail: list admin actions
app.get('/admin/audit', authMiddleware, adminMiddleware, async (req, res, next) => {
	try {
		const page = Math.max(1, parseInt(req.query.page, 10) || 1);
		const per = 30;
		const total = await AuditModel.countDocuments();
		const audits = await AuditModel.find()
			.sort({ createdAt: -1 })
			.skip((page - 1) * per)
			.limit(per)
			.lean();

		// Resolve admin emails for display
		const adminIds = audits.map(a => a.adminId).filter(Boolean);
		let admins = [];
		if (adminIds.length) {
			admins = await UserModel.find({ _id: { $in: adminIds } }).select('email').lean();
		}
		const adminById = (admins || []).reduce((acc, u) => { acc[String(u._id)] = u.email; return acc; }, {});
		const rows = audits.map(a => ({
			action: a.action,
			adminEmail: adminById[String(a.adminId)] || '(unknown)',
			targetEmail: a.targetEmail || '',
			meta: a.meta || {},
			createdAt: a.createdAt
		}));

		res.render('admin_audit', {
			user: req.user,
			rows,
			page,
			per,
			total,
			error: req.flash('error'),
			success: req.flash('success')
		});
	} catch (err) {
		next(err);
	}
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
// Dev delete endpoint (optional, mounted below when enabled)
let devDeleteRouter;

// Import the questions API
const questionsApi = require('./api/questions');
// Import the answers API
const answersApi = require('./api/answers');
// Import the dashboard API
const dashboardApi = require('./api/dashboard');


// Only apply CSRF protection to state-changing routes
app.use((req, res, next) => {
	if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
		return csrfProtection(req, res, next);
	}
	next();
});
app.use('/auth/register', authRegister);
app.use('/auth/login', authLogin);
app.use('/auth/delete-self', authDelete);
// Mount dev delete endpoint if enabled (not mounted in production by default)
try {
	if (process.env.NODE_ENV !== 'production' || String(process.env.ENABLE_DEV_DELETE || '').toLowerCase() === '1') {
		devDeleteRouter = require('./auth/dev_delete');
		app.use('/auth/dev-delete', devDeleteRouter);
		console.log('Dev delete endpoint mounted at /auth/dev-delete');
	}
} catch (e) {
	// best-effort; do not crash startup if dev endpoint is missing
}

// Dev-only quick-login route for local testing. Creates (or finds) an admin user
// and sets a JWT cookie so you can access admin pages without manual login.
if (process.env.NODE_ENV !== 'production') {
	app.get('/dev/quick-login', async (req, res) => {
		try {
			const email = process.env.DEV_ADMIN_EMAIL || 'admin@local';
			// find or create admin user
			let user = await UserModel.findOne({ email });
			if (!user) {
				const pwd = process.env.DEV_ADMIN_PASSWORD || 'devpassword';
				const hash = bcrypt.hashSync(pwd, 10);
				user = await UserModel.create({ email, passwordHash: hash, isAdmin: true });
			} else if (!user.isAdmin) {
				user.isAdmin = true;
				await user.save();
			}

			const jwtLib = require('jsonwebtoken');
			const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME';
			const token = jwtLib.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

			res.cookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 1000 * 60 * 60 * 24 * 30,
			});

			// mark dev quick login with a short-lived cookie so UI can show a banner
			res.cookie('dev_quick', '1', { maxAge: 1000 * 60 * 5, httpOnly: false });

			// Redirect to admin users page
			res.redirect('/admin/users');
		} catch (err) {
			console.error('Dev quick-login error:', err);
			res.status(500).send('Dev quick-login failed');
		}
	});
	console.log('Dev quick-login available at /dev/quick-login');
}
// Dev-only helper to create audit entries for deterministic E2E tests.
// This endpoint is intentionally only mounted in non-production environments.
if (process.env.NODE_ENV !== 'production') {
	app.post('/dev/create-audit', bodyParser.urlencoded({ extended: true }), async (req, res) => {
		try {
			// If a secret is configured for dev E2E operations, require it here.
			const configuredSecret = String(process.env.DEV_E2E_SECRET || '').trim();
			if (configuredSecret) {
				const supplied = (req.body && (req.body.secret || req.body._secret)) || req.get('x-dev-e2e-secret') || req.headers['x-dev-e2e-secret'];
				if (!supplied || String(supplied) !== configuredSecret) {
					return res.status(403).json({ error: 'forbidden' });
				}
			}
			const action = (req.body && req.body.action) ? String(req.body.action) : 'e2e_test';
			const targetEmail = (req.body && req.body.targetEmail) ? String(req.body.targetEmail) : null;
			const adminEmail = (req.body && req.body.adminEmail) ? String(req.body.adminEmail) : null;
			let adminId = null;
			if (adminEmail) {
				try {
					const u = await UserModel.findOne({ email: adminEmail }).select('_id').lean();
					if (u && u._id) adminId = u._id;
				} catch (e) { /* ignore lookup errors */ }
			}
			let meta = { source: 'dev_create_audit' };
			if (req.body && req.body.meta) {
				try { meta = typeof req.body.meta === 'string' ? JSON.parse(req.body.meta) : req.body.meta; } catch (e) { meta = { raw: req.body.meta }; }
			}
			await AuditModel.create({ action, adminId, targetEmail, meta });
			return res.json({ ok: true });
		} catch (err) {
			console.error('Dev create-audit error:', err && err.message);
			return res.status(500).json({ error: 'failed to create audit' });
		}
	});
	console.log('Dev create-audit endpoint mounted at /dev/create-audit');
}
app.use('/api/questions', questionsApi);
app.use('/api/answers', answersApi);
app.use('/api/dashboard', dashboardApi);


// CSRF error handler
app.use((err, req, res, next) => {
	if (err && err.code === 'EBADCSRFTOKEN') {
		errorEvents.inc({ route: req.originalUrl, type: 'csrf' });
		// Dev-only verbose logging to diagnose CSRF failures. This logs
		// cookies, incoming CSRF header/form value, and request meta so
		// you can reproduce and fix cookie/token mismatches.
		try {
			if ((process.env.NODE_ENV || 'development') !== 'production') {
				try {
					console.warn('[CSRF DEBUG] Invalid CSRF token for request:', req.method, req.originalUrl);
					console.warn('[CSRF DEBUG] IP:', req.ip);
					console.warn('[CSRF DEBUG] req.cookies:', JSON.stringify(req.cookies || {}));
					console.warn('[CSRF DEBUG] Cookie header:', req.get('cookie'));
					console.warn('[CSRF DEBUG] X-CSRF-Token header:', req.get('X-CSRF-Token') || req.get('x-csrf-token'));
					// body may be either urlencoded or JSON
					try { console.warn('[CSRF DEBUG] body._csrf:', req.body && req.body._csrf); } catch (e) { console.warn('[CSRF DEBUG] body not parseable'); }
				} catch (e) {
					console.warn('[CSRF DEBUG] failed to print debug info:', e && e.message);
				}
			}
		} catch (e) {
			// ignore debug logging failures
		}

		return res.status(403).json({ error: 'Invalid CSRF token' });
	}
	next(err);
});

// General error logging middleware
app.use((err, req, res, next) => {
	errorEvents.inc({ route: req.originalUrl, type: 'server' });
	console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
	res.status(500).json({ error: 'Internal server error' });
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
