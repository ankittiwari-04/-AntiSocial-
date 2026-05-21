import { Router } from 'express';
import { and, eq, ilike, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { follows, notifications, users } from '../models/schema.js';
import verifyToken from '../middleware/verifyToken.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/search/:query', async (req, res) => {
  try {
    const result = await db.select({
      id: users.id,
      username: users.username,
      profilePicture: users.profilePicture,
      bio: users.bio,
      isVerified: users.isVerified,
    }).from(users).where(ilike(users.username, `%${req.params.query}%`)).limit(10);

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userRows = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!userRows.length) return res.status(404).json({ message: 'User not found' });

    const [followersCount] = await db.select({ count: sql`count(*)::int` }).from(follows).where(eq(follows.followingId, req.params.id));
    const [followingCount] = await db.select({ count: sql`count(*)::int` }).from(follows).where(eq(follows.followerId, req.params.id));

    return res.status(200).json({ ...userRows[0], followers: Array(Number(followersCount?.count || 0)).fill('x'), following: Array(Number(followingCount?.count || 0)).fill('x') });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/:id', verifyToken, upload.fields([{ name: 'profilePicture' }, { name: 'coverPhoto' }]), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ message: 'Not authorized' });

    const updates = { ...req.body, updatedAt: new Date() };
    if (req.files?.profilePicture) updates.profilePicture = req.files.profilePicture[0].path;
    if (req.files?.coverPhoto) updates.coverPhoto = req.files.coverPhoto[0].path;

    const [updated] = await db.update(users).set(updates).where(eq(users.id, req.params.id)).returning();
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/:id/follow', verifyToken, async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: "Can't follow yourself" });

    const rel = await db.select().from(follows).where(and(eq(follows.followerId, req.user.id), eq(follows.followingId, req.params.id))).limit(1);
    if (!rel.length) {
      await db.insert(follows).values({ followerId: req.user.id, followingId: req.params.id });
      await db.insert(notifications).values({ recipientId: req.params.id, senderId: req.user.id, type: 'follow', message: `${req.user.username} followed you` });
      return res.json({ message: 'Followed', following: true });
    }

    await db.delete(follows).where(and(eq(follows.followerId, req.user.id), eq(follows.followingId, req.params.id)));
    return res.json({ message: 'Unfollowed', following: false });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
