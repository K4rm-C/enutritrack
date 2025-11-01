// doctor-service/src/app.ts
import express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const app = express();
app.use(express.json());
app.use(express.xml());

// Dashboard
app.get('/api/doctor/dashboard', authenticateToken, async (req: any, res) => {
  const doctorId = req.user.id;
  
  const dashboardData = {
    totalPacientes: await getTotalPatients(doctorId),
    citasHoy: await getTodayAppointments(doctorId),
    alertasPendientes: await getPendingAlerts(doctorId),
    proximasCitas: await getUpcomingAppointments(doctorId),
    pacientesRecientes: await getRecentPatients(doctorId)
  };
  
  res.json(dashboardData);
});

// Gestión de pacientes
app.get('/api/doctor/patients', authenticateToken, async (req: any, res) => {
  const doctorId = req.user.id;
  const { page = 1, limit = 10, search } = req.query;
  
  const patients = await getDoctorPatients(doctorId, { page, limit, search });
  res.json(patients);
});

app.get('/api/doctor/patients/:patientId', authenticateToken, async (req: any, res) => {
  const { patientId } = req.params;
  const patientDetail = await getPatientDetail(patientId);
  res.json(patientDetail);
});

app.get('/api/doctor/patients/:patientId/medical-history', authenticateToken, async (req: any, res) => {
  const { patientId } = req.params;
  
  const medicalHistory = {
    condiciones: await getMedicalConditions(patientId),
    alergias: await getAllergies(patientId),
    medicamentos: await getMedications(patientId),
    historialPeso: await getWeightHistory(patientId)
  };
  
  res.json(medicalHistory);
});

// Agregar condición médica
app.post('/api/doctor/patients/:patientId/medical-conditions', authenticateToken, async (req: any, res) => {
  const { patientId } = req.params;
  const conditionData = req.body;
  
  const newCondition = await addMedicalCondition(patientId, conditionData);
  res.json(newCondition);
});

// Agregar alergia
app.post('/api/doctor/patients/:patientId/allergies', authenticateToken, async (req: any, res) => {
  const { patientId } = req.params;
  const allergyData = req.body;
  
  const newAllergy = await addAllergy(patientId, allergyData);
  res.json(newAllergy);
});

// Agregar medicamento
app.post('/api/doctor/patients/:patientId/medications', authenticateToken, async (req: any, res) => {
  const { patientId } = req.params;
  const medicationData = req.body;
  
  const newMedication = await addMedication(patientId, medicationData);
  res.json(newMedication);
});