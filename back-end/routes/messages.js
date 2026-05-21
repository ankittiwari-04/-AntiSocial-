import { Router } from 'express';
import { and, asc, desc, eq, inArray, or } from 'drizzle-orm';
import { db } from '../config/db.js';
import { messages, users } from '../models/schema.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const rows = await db.select().from(messages).where(or(and(eq(messages.senderId, req.user.id), eq(messages.receiverId, req.params.userId)), and(eq(messages.senderId, req.params.userId), eq(messages.receiverId, req.user.id)))).orderBy(asc(messages.createdAt));

    await db.update(messages).set({ isRead: true }).where(and(eq(messages.senderId, req.params.userId), eq(messages.receiverId, req.user.id), eq(messages.isRead, false)));
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const rows = await db.select().from(messages).where(or(eq(messages.senderId, req.user.id), eq(messages.receiverId, req.user.id))).orderBy(desc(messages.createdAt));
    const ids = [...new Set(rows.flatMap((r) => [r.senderId, r.receiverId]))];
    const userRows = ids.length ? await db.select().from(users).where(inArray(users.id, ids)) : [];
    const userMap = new Map(userRows.map((u) => [u.id, u]));

    const seen = new Set();
    const conversations = rows.filter((m) => {
      const key = [m.senderId, m.receiverId].sort().join('-');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((m) => ({ ...m, senderId: userMap.get(m.senderId), receiverId: userMap.get(m.receiverId) }));

    return res.json(conversations);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
