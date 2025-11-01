// activity-service/src/app.ts
import express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const app = express();
app.use(express.json());
app.use(express.xml());

// Actividad física del paciente
app.get('/api/activity/logs', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const { fecha, tipo_actividad } = req.query;
  
  const activities = await getPatientActivities(patientId, { fecha, tipo_actividad });
  res.json(activities);
});

app.post('/api/activity/logs', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const activityData = req.body;
  
  const newActivity = await addActivity(patientId, activityData);
  res.json(newActivity);
});

// Tipos de actividad (catálogo)
app.get('/api/activity/types', async (req, res) => {
  const { categoria } = req.query;
  const cacheKey = `activity-types:${categoria}`;
  
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  const types = await getActivityTypes({ categoria });
  await redisClient.set(cacheKey, JSON.stringify(types), 'EX', 86400);
  res.json(types);
});

// Resumen de actividad
app.get('/api/activity/summary', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const { startDate, endDate } = req.query;
  
  const summary = await getActivitySummary(patientId, { startDate, endDate });
  res.json(summary);
});