import express from 'express';
import { state } from '../models/db.js';

export const activityRouter = express.Router();

// GET activity logs
activityRouter.get('/', (req, res) => {
  const limit = parseInt(req.query.limit || '100', 10);
  res.json({
    success: true,
    data: state.activityLogs.slice(0, limit)
  });
});
