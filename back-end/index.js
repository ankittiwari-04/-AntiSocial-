import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import db from './config/db.js';
import socketHandler from './socket/socketHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import storyRoutes from './routes/stories.js';
import communityRoutes from './routes/communities.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import aiRoutes from './routes/ai.js';
import paymentRoutes from './routes/payments.js';
import cloudinary from './config/cloudinary.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://anti-social-lime.vercel.app',
  process.env.CLIENT_URL,
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Allow all vercel.app preview URLs
    if (origin.includes('vercel.app') || 
        origin.includes('localhost') ||
        allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.includes('vercel.app') || 
          origin.includes('localhost')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);

socketHandler(io);

app.get('/', (req, res) => res.json({ status: 'AntiSocial API running' }));

app.get('/test-cloudinary', async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ 
      success: true, 
      cloudinary: result,
      config: {
        cloud_name: 
          process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: 
          !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: 
          !!process.env.CLOUDINARY_API_SECRET,
      }
    });
  } catch (err) {
    res.json({ 
      success: false, 
      error: err.message 
    });
  }
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await db.execute(
      sql`SELECT COUNT(*) FROM users`
    );
    res.json({ 
      success: true, 
      userCount: result.rows[0].count 
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

try {
  await db.execute(sql`SELECT 1`);
  console.log('✅ Neon PostgreSQL Connected');
} catch (err) {
  console.error('❌ DB Connection Error:', err);
  process.exit(1);
}

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
