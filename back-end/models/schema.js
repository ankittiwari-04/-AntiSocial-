import { pgTable, text, integer, boolean, timestamp, uuid, json } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  profilePicture: text('profile_picture').default(''),
  coverPhoto: text('cover_photo').default(''),
  bio: text('bio').default(''),
  website: text('website').default(''),
  isVerified: boolean('is_verified').default(false),
  isPremium: boolean('is_premium').default(false),
  walletBalance: integer('wallet_balance').default(0),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const follows = pgTable('follows', {
  id: uuid('id').defaultRandom().primaryKey(),
  followerId: uuid('follower_id').references(() => users.id),
  followingId: uuid('following_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').default(''),
  image: text('image').default(''),
  video: text('video').default(''),
  mediaType: text('media_type').default('none'),
  tags: json('tags').default([]),
  isPremium: boolean('is_premium').default(false),
  isModerated: boolean('is_moderated').default(false),
  communityId: uuid('community_id'),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const likes = pgTable('likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => posts.id),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => posts.id),
  userId: uuid('user_id').references(() => users.id),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const stories = pgTable('stories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  media: text('media').notNull(),
  mediaType: text('media_type').default('image'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const storyViewers = pgTable('story_viewers', {
  id: uuid('id').defaultRandom().primaryKey(),
  storyId: uuid('story_id').references(() => stories.id),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const communities = pgTable('communities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').default(''),
  avatar: text('avatar').default(''),
  cover: text('cover').default(''),
  createdBy: uuid('created_by').references(() => users.id),
  isPrivate: boolean('is_private').default(false),
  topics: json('topics').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const communityMembers = pgTable('community_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id),
  userId: uuid('user_id').references(() => users.id),
  role: text('role').default('member'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id),
  receiverId: uuid('receiver_id').references(() => users.id),
  text: text('text').default(''),
  media: text('media').default(''),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientId: uuid('recipient_id').references(() => users.id),
  senderId: uuid('sender_id').references(() => users.id),
  type: text('type').notNull(),
  postId: uuid('post_id'),
  message: text('message').default(''),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id),
  receiverId: uuid('receiver_id').references(() => users.id),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  postId: uuid('post_id'),
  status: text('status').default('pending'),
  razorpayOrderId: text('razorpay_order_id').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});
