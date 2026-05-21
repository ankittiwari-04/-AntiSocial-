import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { or, eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../config/db.js';
import { users } from '../models/schema.js';
import { sendResetEmail } from '../config/email.js';

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
    const { identifier, password } = req.body;
    // identifier can be email OR username
    
    if (!identifier || !password) {
      return res.status(400).json({ 
        message: 'All fields required' 
      });
    }

    // Find user by email OR username
    const isEmail = identifier.includes('@');
    
    const [user] = isEmail 
      ? await db.select().from(users)
          .where(eq(users.email, identifier.toLowerCase()))
      : await db.select().from(users)
          .where(eq(users.username, identifier));

    if (!user) {
      return res.status(404).json({ 
        message: 'No account found with that email or username' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Wrong password' 
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { password: _, ...userData } = user;
    return res.status(200).json({ token, user: userData });
    
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      message: err.message 
    });
  }
});

// FORGOT PASSWORD — sends reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({ 
        message: 'If that email exists, a reset link was sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await db.update(users)
      .set({ resetToken, resetTokenExpiry })
      .where(eq(users.id, user.id));

    // Send email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendResetEmail(user.email, resetUrl);

    res.status(200).json({ 
      message: 'If that email exists, a reset link was sent.' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// RESET PASSWORD — uses token to set new password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Find user with valid token
    const [user] = await db.select()
      .from(users)
      .where(eq(users.resetToken, token));

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset link' 
      });
    }

    // Check token hasn't expired
    if (new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({ 
        message: 'Reset link has expired. Please request a new one.' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear token
    await db.update(users)
      .set({ 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      })
      .where(eq(users.id, user.id));

    res.status(200).json({ 
      message: 'Password reset successfully! You can now log in.' 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
