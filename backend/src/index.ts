import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import topicRoutes from './routes/topic';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.route('/api/topic', topicRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: 'Route not found',
    },
    404
  );
});

const port = process.env.PORT || 3001;

console.log(`🚀 Server is running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
