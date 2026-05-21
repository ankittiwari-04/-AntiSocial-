import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { notifications, payments, users } from '../models/schema.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/tip', verifyToken, async (req, res) => {
  try {
    const { receiverId, amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `tip_${Date.now()}`,
    });

    await db.insert(payments).values({
      senderId: req.user.id,
      receiverId,
      amount,
      type: 'tip',
      status: 'pending',
      razorpayOrderId: order.id,
    });

    return res.json({ orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
    if (expected !== signature) return res.status(400).json({ message: 'Invalid signature' });

    const paymentRows = await db.select().from(payments).where(eq(payments.razorpayOrderId, orderId)).limit(1);
    if (!paymentRows.length) return res.status(404).json({ message: 'Payment not found' });

    const payment = paymentRows[0];
    await db.update(payments).set({ status: 'success' }).where(eq(payments.id, payment.id));
    const creditAmount = Math.floor(payment.amount * 0.9);
    await db.update(users).set({ walletBalance: sql`${users.walletBalance} + ${creditAmount}` }).where(eq(users.id, payment.receiverId));

    const senderRows = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    await db.insert(notifications).values({
      recipientId: payment.receiverId,
      senderId: req.user.id,
      type: 'tip',
      message: `${senderRows[0]?.username || 'Someone'} sent you ₹${payment.amount} tip!`,
    });

    return res.json({ message: 'Payment verified and wallet credited!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
