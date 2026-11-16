import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { state, logActivity } from '../models/db.js';
import { config } from '../config/config.js';
import { authenticate } from '../middleware/auth.js';

export const authRouter = express.Router();

// POST /api/v1/auth/login
authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  const user = state.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user) {
    logActivity('AUTH_FAILED', `Failed login attempt for username: ${username}`, 'warning', 'Security');
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    logActivity('AUTH_FAILED', `Failed password attempt for user: ${username}`, 'warning', 'Security');
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  logActivity('AUTH_SUCCESS', `Administrator ${user.username} logged in successfully`, 'success', 'Security');

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// GET /api/v1/auth/me
authRouter.get('/me', authenticate, (req, res) => {
  const user = state.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// POST /api/v1/auth/change-password
authRouter.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
  }

  const user = state.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ success: false, error: 'Current password is incorrect' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  logActivity('PASSWORD_CHANGED', `Administrator ${user.username} updated their password`, 'info', 'Security');

  res.json({ success: true, message: 'Password updated successfully' });
});
