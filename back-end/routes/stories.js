import { Router } from 'express';
import { and, desc, eq, gt, inArray } from 'drizzle-orm';
import { db } from '../config/db.js';
import { follows, stories, storyViewers, users } from '../models/schema.js';
import verifyToken from '../middleware/verifyToken.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post('/', verifyToken, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Media required' });
    const isVideo = req.file.mimetype?.startsWith('video');
    const [story] = await db.insert(stories).values({
      userId: req.user.id,
      media: req.file.path,
      mediaType: isVideo ? 'video' : 'image',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }).returning();
    return res.status(201).json(story);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/feed', verifyToken, async (req, res) => {
  try {
    const following = await db.select({ id: follows.followingId }).from(follows).where(eq(follows.followerId, req.user.id));
    const ids = [...following.map((f) => f.id), req.user.id];
    const rows = await db.select().from(stories).where(and(inArray(stories.userId, ids), gt(stories.expiresAt, new Date()))).orderBy(desc(stories.createdAt));

    const authorRows = await db.select().from(users).where(inArray(users.id, [...new Set(rows.map((r) => r.userId))]));
    const authorMap = new Map(authorRows.map((u) => [u.id, u]));

    const grouped = {};
    rows.forEach((s) => {
      const uid = s.userId;
      if (!grouped[uid]) grouped[uid] = { user: authorMap.get(uid), stories: [] };
      grouped[uid].stories.push(s);
    });

    return res.json(Object.values(grouped));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/:id/view', verifyToken, async (req, res) => {
  try {
    const existing = await db.select().from(storyViewers).where(and(eq(storyViewers.storyId, req.params.id), eq(storyViewers.userId, req.user.id))).limit(1);
    if (!existing.length) await db.insert(storyViewers).values({ storyId: req.params.id, userId: req.user.id });
    return res.json({ message: 'Viewed' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
