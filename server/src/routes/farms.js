import express from 'express';
import { state, logActivity, saveStateToFile } from '../models/db.js';
import { broadcast } from '../websocket/wsServer.js';

export const farmsRouter = express.Router();

// GET all farms
farmsRouter.get('/', (req, res) => {
  res.json({ success: true, data: state.farms });
});

// POST create new farm
farmsRouter.post('/', (req, res) => {
  const { name, type, dimension, coordinates, assignedBot, description, expectedResources } = req.body;
  if (!name || !coordinates) {
    return res.status(400).json({ success: false, error: 'Name and Coordinates are required' });
  }

  const id = `farm-${Date.now()}`;
  const newFarm = {
    id,
    name,
    type: type || 'Custom Farm',
    dimension: dimension || 'Overworld',
    coordinates: {
      x: Number(coordinates.x || 0),
      y: Number(coordinates.y || 64),
      z: Number(coordinates.z || 0)
    },
    assignedBot: assignedBot || 'None',
    description: description || '',
    expectedResources: expectedResources || 'Items',
    status: 'active',
    lastVerified: new Date().toISOString()
  };

  state.farms.push(newFarm);
  saveStateToFile();
  logActivity('FARM_CREATED', `New farm registered: ${name} at (${newFarm.coordinates.x}, ${newFarm.coordinates.y}, ${newFarm.coordinates.z})`, 'info', 'FarmManager');
  broadcast({ type: 'FARMS_UPDATE', payload: state.farms });

  res.status(201).json({ success: true, data: newFarm });
});

// PATCH update farm
farmsRouter.patch('/:id', (req, res) => {
  const farm = state.farms.find(f => f.id === req.params.id);
  if (!farm) return res.status(404).json({ success: false, error: 'Farm not found' });

  const { name, coordinates, assignedBot, description, status } = req.body;
  if (name) farm.name = name;
  if (coordinates) {
    farm.coordinates = {
      x: Number(coordinates.x ?? farm.coordinates.x),
      y: Number(coordinates.y ?? farm.coordinates.y),
      z: Number(coordinates.z ?? farm.coordinates.z),
    };
  }
  if (assignedBot !== undefined) farm.assignedBot = assignedBot;
  if (description !== undefined) farm.description = description;
  if (status !== undefined) farm.status = status;

  saveStateToFile();
  logActivity('FARM_UPDATED', `Updated farm ${farm.name} coordinates to (${farm.coordinates.x}, ${farm.coordinates.y}, ${farm.coordinates.z})`, 'info', 'FarmManager');
  broadcast({ type: 'FARMS_UPDATE', payload: state.farms });

  res.json({ success: true, data: farm });
});

// DELETE remove farm
farmsRouter.delete('/:id', (req, res) => {
  const index = state.farms.findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Farm not found' });

  const removed = state.farms.splice(index, 1)[0];
  saveStateToFile();
  logActivity('FARM_DELETED', `Farm removed: ${removed.name}`, 'warning', 'FarmManager');
  broadcast({ type: 'FARMS_UPDATE', payload: state.farms });

  res.json({ success: true, message: `Farm ${removed.name} removed successfully` });
});
