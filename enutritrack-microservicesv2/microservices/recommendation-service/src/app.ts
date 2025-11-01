// recommendation-service/src/app.ts
import express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const app = express();
app.use(express.json());
app.use(express.xml());

// Recomendaciones del paciente
app.get('/api/recommendations/patient', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const { activas, tipo, prioridad } = req.query;
  
  const recommendations = await getPatientRecommendations(patientId, { activas, tipo, prioridad });
  res.json(recommendations);
});

// Recomendaciones del doctor para paciente
app.get('/api/doctor/patients/:patientId/recommendations', authenticateToken, async (req: any, res) => {
  const { patientId } = req.params;
  const recommendations = await getDoctorRecommendationsForPatient(patientId);
  res.json(recommendations);
});

// Crear recomendación (doctor)
app.post('/api/doctor/recommendations', authenticateToken, async (req: any, res) => {
  const doctorId = req.user.id;
  const recommendationData = req.body;
  
  const newRecommendation = await createDoctorRecommendation(doctorId, recommendationData);
  res.json(newRecommendation);
});

// Crear recomendación de IA
app.post('/api/ai/recommendations', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const contextData = req.body;
  
  const aiRecommendation = await generateAIRecommendation(patientId, contextData);
  res.json(aiRecommendation);
});

// Marcar recomendación como completada
app.put('/api/recommendations/:recommendationId/complete', authenticateToken, async (req: any, res) => {
  const { recommendationId } = req.params;
  const { feedback } = req.body;
  
  const updated = await markRecommendationComplete(recommendationId, feedback);
  res.json(updated);
});

// Datos de recomendación
app.get('/api/recommendations/:recommendationId/data', authenticateToken, async (req: any, res) => {
  const { recommendationId } = req.params;
  const data = await getRecommendationData(recommendationId);
  res.json(data);
});

// Tipos de recomendación (catálogo)
app.get('/api/catalog/recommendation-types', async (req, res) => {
  const cacheKey = 'catalog:recommendation-types';
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const types = await getRecommendationTypes();
  await redisClient.set(cacheKey, JSON.stringify(types), 'EX', 86400);
  res.json(types);
});

// Generar recomendaciones automáticas basadas en datos
app.post('/api/ai/generate-recommendations', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const { dataType, dataRange } = req.body;
  
  const recommendations = await generateAutomaticRecommendations(patientId, { dataType, dataRange });
  res.json(recommendations);
});