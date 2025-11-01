// patient-service/src/app.ts
import express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const app = express();
app.use(express.json());
app.use(express.xml());

// Dashboard paciente
app.get('/api/patient/dashboard', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  
  const dashboardData = {
    pesoActual: await getCurrentWeight(patientId),
    proximaCita: await getNextAppointment(patientId),
    alertasRecientes: await getRecentAlerts(patientId),
    recomendacionesPendientes: await getPendingRecommendations(patientId)
  };
  
  res.json(dashboardData);
});

// Gestión de condiciones médicas
app.get('/api/patient/medical-conditions', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const conditions = await getMedicalConditions(patientId);
  res.json(conditions);
});

app.post('/api/patient/medical-conditions', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const conditionData = req.body;
  
  const newCondition = await addMedicalCondition(patientId, conditionData);
  res.json(newCondition);
});

app.put('/api/patient/medical-conditions/:conditionId', authenticateToken, async (req: any, res) => {
  const { conditionId } = req.params;
  const updates = req.body;
  
  const updatedCondition = await updateMedicalCondition(conditionId, updates);
  res.json(updatedCondition);
});

// Gestión de alergias
app.get('/api/patient/allergies', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const allergies = await getAllergies(patientId);
  res.json(allergies);
});

app.post('/api/patient/allergies', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const allergyData = req.body;
  
  const newAllergy = await addAllergy(patientId, allergyData);
  res.json(newAllergy);
});

// Gestión de medicamentos
app.get('/api/patient/medications', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const medications = await getMedications(patientId);
  res.json(medications);
});

app.post('/api/patient/medications', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const medicationData = req.body;
  
  const newMedication = await addMedication(patientId, medicationData);
  res.json(newMedication);
});

app.put('/api/patient/medications/:medicationId', authenticateToken, async (req: any, res) => {
  const { medicationId } = req.params;
  const updates = req.body;
  
  const updatedMedication = await updateMedication(medicationId, updates);
  res.json(updatedMedication);
});

// Historial de peso
app.get('/api/patient/weight-history', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const { startDate, endDate } = req.query;
  
  const weightHistory = await getWeightHistory(patientId, { startDate, endDate });
  res.json(weightHistory);
});

app.post('/api/patient/weight-history', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const weightData = req.body;
  
  const newWeightEntry = await addWeightEntry(patientId, weightData);
  res.json(newWeightEntry);
});

// Objetivos
app.get('/api/patient/goals', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const goals = await getPatientGoals(patientId);
  res.json(goals);
});

app.post('/api/patient/goals', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const goalData = req.body;
  
  const newGoal = await setPatientGoal(patientId, goalData);
  res.json(newGoal);
});