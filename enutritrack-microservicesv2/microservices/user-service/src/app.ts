// user-service/src/app.ts
import express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const app = express();
app.use(express.json());
app.use(express.xml());

// Perfil del doctor
app.get('/api/users/doctor/profile', authenticateToken, async (req: any, res) => {
  const doctorId = req.user.id;
  const cacheKey = `doctor:${doctorId}:profile`;
  
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  const profile = await getDoctorProfile(doctorId);
  await redisClient.set(cacheKey, JSON.stringify(profile), 'EX', 3600);
  res.json(profile);
});

app.put('/api/users/doctor/profile', authenticateToken, async (req: any, res) => {
  const doctorId = req.user.id;
  const updates = req.body;
  
  const updatedProfile = await updateDoctorProfile(doctorId, updates);
  await redisClient.del(`doctor:${doctorId}:profile`);
  res.json(updatedProfile);
});

// Perfil del paciente
app.get('/api/users/patient/profile', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const cacheKey = `patient:${patientId}:profile`;
  
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  const profile = await getPatientProfile(patientId);
  await redisClient.set(cacheKey, JSON.stringify(profile), 'EX', 3600);
  res.json(profile);
});

app.put('/api/users/patient/profile', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const updates = req.body;
  
  const updatedProfile = await updatePatientProfile(patientId, updates);
  await redisClient.del(`patient:${patientId}:profile`);
  res.json(updatedProfile);
});

// Especialidades (catálogo)
app.get('/api/catalog/specialties', async (req, res) => {
  const cacheKey = 'catalog:specialties';
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const specialties = await getSpecialties();
  await redisClient.set(cacheKey, JSON.stringify(specialties), 'EX', 86400);
  res.json(specialties);
});

// Géneros (catálogo)
app.get('/api/catalog/genders', async (req, res) => {
  const cacheKey = 'catalog:genders';
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const genders = await getGenders();
  await redisClient.set(cacheKey, JSON.stringify(genders), 'EX', 86400);
  res.json(genders);
});