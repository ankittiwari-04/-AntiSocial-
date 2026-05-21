import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../config/db.js';
import { follows, likes, comments, posts, users } from '../models/schema.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/caption', verifyToken, async (req, res) => {
  try {
    const { topic, tone } = req.body;
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Write 3 short, engaging social media captions for: "${topic}". Tone: ${tone || 'casual'}. Reply JSON only: { "captions": ["c1","c2","c3"] }`,
      }],
    });
    return res.json(JSON.parse(response.content[0].text));
  } catch {
    return res.status(500).json({ message: 'AI error' });
  }
});

router.post('/bio', verifyToken, async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const recentPosts = await db.select().from(posts).where(eq(posts.userId, req.user.id)).orderBy(desc(posts.createdAt)).limit(5);
    const postSummary = recentPosts.map((p) => p.content).join(' | ');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Write a catchy social bio (max 120 chars) for "${user.username}" based on: "${postSummary || 'general content creator'}". Reply JSON only: { "bio": "..." }`,
      }],
    });

    return res.json(JSON.parse(response.content[0].text));
  } catch {
    return res.status(500).json({ message: 'AI error' });
  }
});

router.get('/smart-feed', verifyToken, async (req, res) => {
  try {
    const followingRows = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, req.user.id));
    const ids = [...followingRows.map((f) => f.followingId), req.user.id];
    const rows = await db.select().from(posts).where(and(inArray(posts.userId, ids), eq(posts.isModerated, false))).orderBy(desc(posts.createdAt)).limit(50);

    const postIds = rows.map((p) => p.id);
    const userIds = [...new Set(rows.map((p) => p.userId))];
    const [authorRows, likeRows, commentRows] = await Promise.all([
      userIds.length ? db.select().from(users).where(inArray(users.id, userIds)) : [],
      postIds.length ? db.select().from(likes).where(inArray(likes.postId, postIds)) : [],
      postIds.length ? db.select().from(comments).where(inArray(comments.postId, postIds)) : [],
    ]);

    const authorMap = new Map(authorRows.map((u) => [u.id, u]));
    const likesMap = likeRows.reduce((acc, l) => { acc[l.postId] = (acc[l.postId] || 0) + 1; return acc; }, {});
    const commentsMap = commentRows.reduce((acc, c) => { acc[c.postId] = (acc[c.postId] || 0) + 1; return acc; }, {});

    const ranked = rows.map((p) => ({
      ...p,
      userId: authorMap.get(p.userId),
      likes: Array(likesMap[p.id] || 0).fill('x'),
      comments: Array(commentsMap[p.id] || 0).fill('x'),
      score: ((likesMap[p.id] || 0) * 3) + ((commentsMap[p.id] || 0) * 2) + (Date.now() - new Date(p.createdAt).getTime() < 3600000 ? 10 : 0),
    })).sort((a, b) => b.score - a.score);

    return res.json(ranked);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/hashtags', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: `Suggest 8 hashtags for: "${content}". Reply JSON only: { "hashtags": ["#...", "#...", "#..."] }` }],
    });
    return res.json(JSON.parse(response.content[0].text));
  } catch {
    return res.status(500).json({ message: 'AI error' });
  }
});

export default router;
