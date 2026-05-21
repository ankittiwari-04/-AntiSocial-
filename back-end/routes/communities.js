import { Router } from 'express';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../config/db.js';
import { communities, communityMembers, posts, users } from '../models/schema.js';
import verifyToken from '../middleware/verifyToken.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post('/', verifyToken, upload.fields([{ name: 'avatar' }, { name: 'cover' }]), async (req, res) => {
  try {
    const { name, description, topics, isPrivate } = req.body;
    const [community] = await db.insert(communities).values({
      name,
      description,
      isPrivate: isPrivate === 'true',
      topics: topics ? topics.split(',').map((t) => t.trim()) : [],
      createdBy: req.user.id,
      avatar: req.files?.avatar?.[0]?.path || '',
      cover: req.files?.cover?.[0]?.path || '',
    }).returning();

    await db.insert(communityMembers).values({ communityId: community.id, userId: req.user.id, role: 'admin' });
    return res.status(201).json(community);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const rows = await db.select().from(communities).where(eq(communities.isPrivate, false)).orderBy(desc(communities.createdAt));
    const ids = rows.map((r) => r.createdBy).filter(Boolean);
    const creators = ids.length ? await db.select().from(users).where(inArray(users.id, ids)) : [];
    const creatorMap = new Map(creators.map((u) => [u.id, u]));

    return res.json(rows.map((r) => ({ ...r, createdBy: creatorMap.get(r.createdBy) || null })));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const communityRows = await db.select().from(communities).where(eq(communities.id, req.params.id)).limit(1);
    if (!communityRows.length) return res.status(404).json({ message: 'Community not found' });

    const memberRows = await db.select().from(communityMembers).where(eq(communityMembers.communityId, req.params.id));
    const memberIds = [...new Set(memberRows.map((m) => m.userId))];
    const members = memberIds.length ? await db.select().from(users).where(inArray(users.id, memberIds)) : [];
    const memberMap = new Map(members.map((u) => [u.id, u]));

    const communityPosts = await db.select().from(posts).where(eq(posts.communityId, req.params.id)).orderBy(desc(posts.createdAt));
    const postAuthorIds = [...new Set(communityPosts.map((p) => p.userId))];
    const postAuthors = postAuthorIds.length ? await db.select().from(users).where(inArray(users.id, postAuthorIds)) : [];
    const authorMap = new Map(postAuthors.map((u) => [u.id, u]));

    const payload = {
      ...communityRows[0],
      members: memberRows.map((m) => memberMap.get(m.userId)).filter(Boolean),
      moderators: memberRows.filter((m) => m.role === 'admin' || m.role === 'moderator').map((m) => memberMap.get(m.userId)).filter(Boolean),
      createdBy: memberMap.get(communityRows[0].createdBy) || null,
    };

    return res.json({ community: payload, posts: communityPosts.map((p) => ({ ...p, userId: authorMap.get(p.userId) || null })) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/:id/join', verifyToken, async (req, res) => {
  try {
    const existing = await db.select().from(communityMembers).where(and(eq(communityMembers.communityId, req.params.id), eq(communityMembers.userId, req.user.id))).limit(1);
    if (!existing.length) {
      await db.insert(communityMembers).values({ communityId: req.params.id, userId: req.user.id, role: 'member' });
      return res.json({ message: 'Joined', isMember: true });
    }

    await db.delete(communityMembers).where(eq(communityMembers.id, existing[0].id));
    return res.json({ message: 'Left', isMember: false });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
