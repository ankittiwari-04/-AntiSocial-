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

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://anti-social-ankittiwari04.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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
