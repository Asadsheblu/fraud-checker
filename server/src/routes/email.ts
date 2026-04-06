import express, { Router } from 'express';
import { emailService } from '../services/emailService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const sendWelcomeEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});

const sendFraudAlertSchema = z.object({
  email: z.string().email(),
  orderId: z.string(),
  riskScore: z.number().min(0).max(100),
  recommendation: z.enum(['approve', 'review', 'block'])
});

const sendVerificationEmailSchema = z.object({
  email: z.string().email(),
  verificationLink: z.string().url()
});

const sendPasswordResetSchema = z.object({
  email: z.string().email(),
  resetLink: z.string().url()
});

const sendSubscriptionConfirmationSchema = z.object({
  email: z.string().email(),
  plan: z.string(),
  price: z.number().positive()
});

const sendDailyDigestSchema = z.object({
  email: z.string().email(),
  stats: z.object({
    totalOrders: z.number().nonnegative(),
    fraudDetected: z.number().nonnegative(),
    totalValue: z.number().nonnegative(),
    avgRiskScore: z.number().nonnegative()
  })
});

// Send welcome email
router.post('/send-welcome', async (req, res) => {
  try {
    const { email, name } = sendWelcomeEmailSchema.parse(req.body);

    const result = await emailService.sendWelcomeEmail(email, name);

    res.json({
      success: true,
      messageId: result.id,
      message: 'Welcome email sent successfully'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Send fraud alert email
router.post('/send-fraud-alert', async (req, res) => {
  try {
    const { email, orderId, riskScore, recommendation } = sendFraudAlertSchema.parse(req.body);

    const result = await emailService.sendFraudAlertEmail(
      email,
      orderId,
      riskScore,
      recommendation
    );

    res.json({
      success: true,
      messageId: result.id,
      message: 'Fraud alert email sent successfully'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Send verification email
router.post('/send-verification', async (req, res) => {
  try {
    const { email, verificationLink } = sendVerificationEmailSchema.parse(req.body);

    const result = await emailService.sendVerificationEmail(email, verificationLink);

    res.json({
      success: true,
      messageId: result.id,
      message: 'Verification email sent successfully'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Send password reset email
router.post('/send-password-reset', async (req, res) => {
  try {
    const { email, resetLink } = sendPasswordResetSchema.parse(req.body);

    const result = await emailService.sendPasswordResetEmail(email, resetLink);

    res.json({
      success: true,
      messageId: result.id,
      message: 'Password reset email sent successfully'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Send subscription confirmation email
router.post('/send-subscription-confirmation', async (req, res) => {
  try {
    const { email, plan, price } = sendSubscriptionConfirmationSchema.parse(req.body);

    const result = await emailService.sendSubscriptionConfirmationEmail(email, plan, price);

    res.json({
      success: true,
      messageId: result.id,
      message: 'Subscription confirmation email sent successfully'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Send daily digest email
router.post('/send-daily-digest', async (req, res) => {
  try {
    const { email, stats } = sendDailyDigestSchema.parse(req.body);

    const safeStats = {
      totalOrders: stats.totalOrders ?? 0,
      fraudDetected: stats.fraudDetected ?? 0,
      totalValue: stats.totalValue ?? 0,
      avgRiskScore: stats.avgRiskScore ?? 0
    };

    const result = await emailService.sendDailyDigestEmail(email, safeStats);

    res.json({
      success: true,
      messageId: result.id,
      message: 'Daily digest email sent successfully'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
