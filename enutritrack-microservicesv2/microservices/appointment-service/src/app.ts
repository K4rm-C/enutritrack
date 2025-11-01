// appointment-service/src/app.ts
import express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const app = express();
app.use(express.json());
app.use(express.xml());

// Citas del doctor
app.get('/api/appointments/doctor', authenticateToken, async (req: any, res) => {
  const doctorId = req.user.id;
  const { fecha, estado, page = 1, limit = 10 } = req.query;
  
  const appointments = await getDoctorAppointments(doctorId, { fecha, estado, page, limit });
  res.json(appointments);
});

// Citas del paciente
app.get('/api/appointments/patient', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const { fecha, estado } = req.query;
  
  const appointments = await getPatientAppointments(patientId, { fecha, estado });
  res.json(appointments);
});

// Detalle de cita
app.get('/api/appointments/:appointmentId', authenticateToken, async (req: any, res) => {
  const { appointmentId } = req.params;
  const appointment = await getAppointmentDetail(appointmentId);
  res.json(appointment);
});

// Crear cita
app.post('/api/appointments', authenticateToken, async (req: any, res) => {
  const appointmentData = req.body;
  const newAppointment = await createAppointment(appointmentData);
  res.json(newAppointment);
});

// Actualizar cita
app.put('/api/appointments/:appointmentId', authenticateToken, async (req: any, res) => {
  const { appointmentId } = req.params;
  const updates = req.body;
  
  const updatedAppointment = await updateAppointment(appointmentId, updates);
  res.json(updatedAppointment);
});

// Signos vitales de cita
app.get('/api/appointments/:appointmentId/vitals', authenticateToken, async (req: any, res) => {
  const { appointmentId } = req.params;
  const vitals = await getAppointmentVitals(appointmentId);
  res.json(vitals);
});

app.post('/api/appointments/:appointmentId/vitals', authenticateToken, async (req: any, res) => {
  const { appointmentId } = req.params;
  const vitalsData = req.body;
  
  const newVitals = await addAppointmentVitals(appointmentId, vitalsData);
  res.json(newVitals);
});

// Documentos de cita
app.get('/api/appointments/:appointmentId/documents', authenticateToken, async (req: any, res) => {
  const { appointmentId } = req.params;
  const documents = await getAppointmentDocuments(appointmentId);
  res.json(documents);
});

app.post('/api/appointments/:appointmentId/documents', authenticateToken, async (req: any, res) => {
  const { appointmentId } = req.params;
  const documentData = req.body;
  
  const newDocument = await addAppointmentDocument(appointmentId, documentData);
  res.json(newDocument);
});

// Tipos de consulta (catálogo)
app.get('/api/catalog/consultation-types', async (req, res) => {
  const cacheKey = 'catalog:consultation-types';
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const types = await getConsultationTypes();
  await redisClient.set(cacheKey, JSON.stringify(types), 'EX', 86400);
  res.json(types);
});

// Estados de cita (catálogo)
app.get('/api/catalog/appointment-statuses', async (req, res) => {
  const cacheKey = 'catalog:appointment-statuses';
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const statuses = await getAppointmentStatuses();
  await redisClient.set(cacheKey, JSON.stringify(statuses), 'EX', 86400);
  res.json(statuses);
});