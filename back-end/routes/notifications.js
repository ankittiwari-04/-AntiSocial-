import { Router } from 'express';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '../config/db.js';
import { notifications, posts, users } from '../models/schema.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const rows = await db.select().from(notifications).where(eq(notifications.recipientId, req.user.id)).orderBy(desc(notifications.createdAt)).limit(50);

    const senderIds = [...new Set(rows.map((r) => r.senderId).filter(Boolean))];
    const postIds = [...new Set(rows.map((r) => r.postId).filter(Boolean))];
    const senderRows = senderIds.length ? await db.select().from(users).where(inArray(users.id, senderIds)) : [];
    const postRows = postIds.length ? await db.select().from(posts).where(inArray(posts.id, postIds)) : [];
    const senderMap = new Map(senderRows.map((s) => [s.id, s]));
    const postMap = new Map(postRows.map((p) => [p.id, p]));

    return res.json(rows.map((n) => ({ ...n, senderId: senderMap.get(n.senderId) || null, postId: postMap.get(n.postId) || null })));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/read', verifyToken, async (req, res) => {
  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.recipientId, req.user.id));
    return res.json({ message: 'All read' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
