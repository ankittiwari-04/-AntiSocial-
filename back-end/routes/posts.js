import { Router } from 'express';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { comments, follows, likes, notifications, posts, users } from '../models/schema.js';
import verifyToken from '../middleware/verifyToken.js';
import upload from '../middleware/upload.js';
import aiModerate from '../middleware/aiModerate.js';

const router = Router();

const hydratePosts = async (rows) => {
  if (!rows.length) return [];
  const postIds = rows.map((p) => p.id);
  const userIds = [...new Set(rows.map((p) => p.userId))];
  const authorRows = await db.select().from(users).where(inArray(users.id, userIds));
  const likeRows = await db.select().from(likes).where(inArray(likes.postId, postIds));
  const commentRows = await db.select().from(comments).where(inArray(comments.postId, postIds));

  const authorMap = new Map(authorRows.map((u) => [u.id, u]));
  const likesByPost = likeRows.reduce((acc, l) => { acc[l.postId] = acc[l.postId] || []; acc[l.postId].push(l.userId); return acc; }, {});
  const commentsByPost = commentRows.reduce((acc, c) => { acc[c.postId] = acc[c.postId] || []; acc[c.postId].push(c); return acc; }, {});

  return rows.map((p) => ({
    ...p,
    userId: authorMap.get(p.userId),
    likes: likesByPost[p.id] || [],
    comments: commentsByPost[p.id] || [],
  }));
};

router.post('/', verifyToken, upload.single('media'), aiModerate, async (req, res) => {
  try {
    const { content, tags, isPremium, communityId } = req.body;
    const payload = {
      userId: req.user.id,
      content: content || '',
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      isPremium: isPremium === 'true',
      communityId: communityId || null,
      updatedAt: new Date(),
    };

    if (req.file) {
      const isVideo = req.file.mimetype?.startsWith('video') || req.file.path?.includes('video');
      payload.mediaType = isVideo ? 'video' : 'image';
      payload.video = isVideo ? req.file.path : '';
      payload.image = isVideo ? '' : req.file.path;
    }

    const [saved] = await db.insert(posts).values(payload).returning();
    const [hydrated] = await hydratePosts([saved]);
    return res.status(201).json(hydrated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/feed', verifyToken, async (req, res) => {
  try {
    const followingRows = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, req.user.id));
    const ids = [...followingRows.map((f) => f.followingId), req.user.id];
    const result = await db.select().from(posts).where(and(inArray(posts.userId, ids), eq(posts.isModerated, false), sql`${posts.communityId} is null`)).orderBy(desc(posts.createdAt)).limit(30);
    return res.json(await hydratePosts(result));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/explore', async (req, res) => {
  try {
    const whereParts = [eq(posts.isModerated, false), sql`${posts.communityId} is null`];
    if (req.query.type === 'video') whereParts.push(eq(posts.mediaType, 'video'));

    const result = await db.select().from(posts).where(and(...whereParts)).orderBy(desc(posts.createdAt)).limit(50);
    return res.json(await hydratePosts(result));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/:id/like', verifyToken, async (req, res) => {
  try {
    const existing = await db.select().from(likes).where(and(eq(likes.postId, req.params.id), eq(likes.userId, req.user.id))).limit(1);
    if (!existing.length) {
      await db.insert(likes).values({ postId: req.params.id, userId: req.user.id });
      const target = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, req.params.id)).limit(1);
      if (target[0]?.userId && target[0].userId !== req.user.id) {
        await db.insert(notifications).values({ recipientId: target[0].userId, senderId: req.user.id, type: 'like', postId: req.params.id, message: 'liked your post' });
      }
      const [countRow] = await db.select({ count: sql`count(*)::int` }).from(likes).where(eq(likes.postId, req.params.id));
      return res.json({ liked: true, likesCount: Number(countRow.count || 0) });
    }

    await db.delete(likes).where(eq(likes.id, existing[0].id));
    const [countRow] = await db.select({ count: sql`count(*)::int` }).from(likes).where(eq(likes.postId, req.params.id));
    return res.json({ liked: false, likesCount: Number(countRow.count || 0) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });

    await db.insert(comments).values({ postId: req.params.id, userId: req.user.id, text });
    const postRows = await db.select().from(posts).where(eq(posts.id, req.params.id)).limit(1);
    if (postRows[0] && postRows[0].userId !== req.user.id) {
      await db.insert(notifications).values({ recipientId: postRows[0].userId, senderId: req.user.id, type: 'comment', postId: req.params.id, message: `commented: ${text.substring(0, 50)}` });
    }

    const rows = await db.select().from(comments).where(eq(comments.postId, req.params.id)).orderBy(desc(comments.createdAt));
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const found = await db.select().from(posts).where(eq(posts.id, req.params.id)).limit(1);
    if (!found.length) return res.status(404).json({ message: 'Not found' });
    if (found[0].userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await db.delete(posts).where(eq(posts.id, req.params.id));
    return res.json({ message: 'Post deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const result = await db.select().from(posts).where(eq(posts.userId, req.params.userId)).orderBy(desc(posts.createdAt));
    return res.json(await hydratePosts(result));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
