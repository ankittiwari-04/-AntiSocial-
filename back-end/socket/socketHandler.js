import { and, desc, eq, or } from 'drizzle-orm';
import { db } from '../config/db.js';
import { messages } from '../models/schema.js';

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }

    socket.on('sendMessage', async ({ senderId, receiverId, text }) => {
      try {
        const [message] = await db.insert(messages).values({ senderId, receiverId, text }).returning();
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) io.to(receiverSocket).emit('newMessage', message);
        socket.emit('messageSent', message);
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('userTyping', { senderId });
    });

    socket.on('sendNotification', ({ receiverId, notification }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('newNotification', notification);
    });

    socket.on('markConversationRead', async ({ currentUserId, otherUserId }) => {
      await db.update(messages)
        .set({ isRead: true })
        .where(and(eq(messages.receiverId, currentUserId), eq(messages.senderId, otherUserId)));
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

export default socketHandler;
