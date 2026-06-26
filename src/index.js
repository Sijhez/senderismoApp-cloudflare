import { Hono } from 'hono';
import { getDB } from './lib/db.js';
import { sessionMiddleware } from './lib/session.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import hikingRoutes from './routes/hiking-routes.js';

const app = new Hono();

app.onError((err, c) => {
  const dbError = c.get('dbError');
  const detail = dbError ? `\nDB: ${dbError}` : '';
  console.error(`[Error] ${c.req.method} ${c.req.path}:`, err.stack || err.message);
  return c.text(`Error: ${err.message}${detail}`, 500);
});

app.get('/health', (c) => {
  return c.json({
    ok: true,
    env: {
      MONGODB_URI: c.env.MONGODB_URI ? 'set' : 'NOT SET',
      SESSION: c.env.SESSION ? 'set' : 'NOT SET',
    },
  });
});

app.use('*', async (c, next) => {
  if (c.env.MONGODB_URI) {
    try {
      const db = await getDB(c.env.MONGODB_URI);
      c.set('db', db);
    } catch (err) {
      console.error('DB connection failed:', err.message);
      c.set('dbError', err.message);
    }
  } else {
    c.set('dbError', 'MONGODB_URI not set');
  }
  await next();
});

app.use('*', sessionMiddleware);

app.route('/', authRoutes);
app.route('/users', userRoutes);
app.route('/createdRoutes', hikingRoutes);

export default app;
