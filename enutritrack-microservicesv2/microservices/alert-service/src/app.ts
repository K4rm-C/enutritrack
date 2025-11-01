// alert-service/src/app.ts
import express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const app = express();
app.use(express.json());
app.use(express.xml());

// Alertas del doctor
app.get('/api/alerts/doctor', authenticateToken, async (req: any, res) => {
  const doctorId = req.user.id;
  const { estado, prioridad, page = 1, limit = 10 } = req.query;
  
  const alerts = await getDoctorAlerts(doctorId, { estado, prioridad, page, limit });
  res.json(alerts);
});

// Alertas del paciente
app.get('/api/alerts/patient', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const { estado, prioridad } = req.query;
  
  const alerts = await getPatientAlerts(patientId, { estado, prioridad });
  res.json(alerts);
});

// Detalle de alerta
app.get('/api/alerts/:alertId', authenticateToken, async (req: any, res) => {
  const { alertId } = req.params;
  const alert = await getAlertDetail(alertId);
  res.json(alert);
});

// Tomar acción en alerta (doctor)
app.post('/api/alerts/:alertId/action', authenticateToken, async (req: any, res) => {
  const { alertId } = req.params;
  const { accion, descripcion } = req.body;
  const doctorId = req.user.id;
  
  const result = await takeAlertAction(alertId, doctorId, { accion, descripcion });
  res.json(result);
});

// Resolver alerta
app.put('/api/alerts/:alertId/resolve', authenticateToken, async (req: any, res) => {
  const { alertId } = req.params;
  const { notas_resolucion } = req.body;
  const doctorId = req.user.id;
  
  const result = await resolveAlert(alertId, doctorId, notas_resolucion);
  res.json(result);
});

// Historial de acciones de alerta
app.get('/api/alerts/:alertId/actions', authenticateToken, async (req: any, res) => {
  const { alertId } = req.params;
  const actions = await getAlertActions(alertId);
  res.json(actions);
});

// Configuración de alertas automáticas
app.get('/api/patient/alert-configurations', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const configs = await getAlertConfigurations(patientId);
  res.json(configs);
});

app.put('/api/patient/alert-configurations/:configId', authenticateToken, async (req: any, res) => {
  const { configId } = req.params;
  const updates = req.body;
  
  const updatedConfig = await updateAlertConfiguration(configId, updates);
  res.json(updatedConfig);
});

// Catálogos
app.get('/api/catalog/alert-categories', async (req, res) => {
  const cacheKey = 'catalog:alert-categories';
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const categories = await getAlertCategories();
  await redisClient.set(cacheKey, JSON.stringify(categories), 'EX', 86400);
  res.json(categories);
});

app.get('/api/catalog/alert-priorities', async (req, res) => {
  const cacheKey = 'catalog:alert-priorities';
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const priorities = await getAlertPriorities();
  await redisClient.set(cacheKey, JSON.stringify(priorities), 'EX', 86400);
  res.json(priorities);
});

app.get('/api/catalog/alert-statuses', async (req, res) => {
  const cacheKey = 'catalog:alert-statuses';
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const statuses = await getAlertStatuses();
  await redisClient.set(cacheKey, JSON.stringify(statuses), 'EX', 86400);
  res.json(statuses);
});

app.get('/api/catalog/alert-types', async (req, res) => {
  const cacheKey = 'catalog:alert-types';
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const types = await getAlertTypes();
  await redisClient.set(cacheKey, JSON.stringify(types), 'EX', 86400);
  res.json(types);
});