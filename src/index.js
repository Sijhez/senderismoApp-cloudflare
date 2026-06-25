import { Hono } from 'hono';
import { connectDB } from './lib/db.js';
import { sessionMiddleware } from './lib/session.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import hikingRoutes from './routes/hiking-routes.js';

const app = new Hono();

app.use('*', async (c, next) => {
  await connectDB(c.env.MONGODB_URI);
  await next();
});

app.use('*', sessionMiddleware);

app.route('/', authRoutes);
app.route('/users', userRoutes);
app.route('/createdRoutes', hikingRoutes);

export default app;
