import express, { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  company: z.string().min(2),
  firstName: z.string().min(2),
  lastName: z.string().min(2)
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      session: data.session,
      user: data.user,
      message: 'Login successful'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const body = signupSchema.parse(req.body);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user?.id,
          email: body.email,
          first_name: body.firstName,
          last_name: body.lastName,
          company: body.company,
          plan: 'free',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    res.status(201).json({
      message: 'Signup successful',
      user: authData.user
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Verify token
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user: data.user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      await supabase.auth.signOut();
    }

    res.json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
