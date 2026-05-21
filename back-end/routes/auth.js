import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { or, eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { users } from '../models/schema.js';

const router = Router();

router.post('/register', async (req, res) => {
  console.log('Register attempt:', req.body);
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const existing = await db.select().from(users).where(or(eq(users.email, email), eq(users.username, username))).limit(1);
    if (existing.length) return res.status(400).json({ message: 'Username or email already taken' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const [saved] = await db.insert(users).values({ username, email, password: hashedPassword }).returning();

    const token = jwt.sign({ id: saved.id, username: saved.username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userData } = saved;
    return res.status(201).json({ token, user: userData });
  } catch (err) {
    console.error('Register route error:', err);
    return res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!found.length) return res.status(404).json({ message: 'User not found' });

    const user = found[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userData } = user;
    return res.status(200).json({ token, user: userData });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
