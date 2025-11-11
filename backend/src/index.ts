import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import topicRoutes from './routes/topic.js';

// Verify environment variables are loaded
console.log('🔍 Environment Variables Check:');
console.log(`  MEMORY_PROTOCOL_API_TOKEN: ${process.env.MEMORY_PROTOCOL_API_TOKEN ? process.env.MEMORY_PROTOCOL_API_TOKEN.substring(0, 15) + '...' : '❌ NOT SET'}`);
console.log(`  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 15) + '...' : '❌ NOT SET'}`);
console.log(`  PORT: ${process.env.PORT || '3001 (default)'}`);
console.log('');

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

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
