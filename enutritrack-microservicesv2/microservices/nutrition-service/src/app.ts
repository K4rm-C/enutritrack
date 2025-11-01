// nutrition-service/src/app.ts
import express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const app = express();
app.use(express.json());
app.use(express.xml());

// Registro de comida del paciente
app.get('/api/nutrition/food-log', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const { fecha, tipo_comida } = req.query;
  
  const foodLog = await getPatientFoodLog(patientId, { fecha, tipo_comida });
  res.json(foodLog);
});

app.post('/api/nutrition/food-log', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const foodLogData = req.body;
  
  const newFoodLog = await addFoodLog(patientId, foodLogData);
  res.json(newFoodLog);
});

// Items de comida
app.post('/api/nutrition/food-log/:logId/items', authenticateToken, async (req: any, res) => {
  const { logId } = req.params;
  const itemData = req.body;
  
  const newItem = await addFoodLogItem(logId, itemData);
  res.json(newItem);
});

app.delete('/api/nutrition/food-log/items/:itemId', authenticateToken, async (req: any, res) => {
  const { itemId } = req.params;
  await deleteFoodLogItem(itemId);
  res.json({ message: 'Item eliminado' });
});

// Alimentos (catálogo)
app.get('/api/nutrition/foods', async (req, res) => {
  const { search, categoria } = req.query;
  const cacheKey = `foods:${search}:${categoria}`;
  
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  const foods = await getFoods({ search, categoria });
  await redisClient.set(cacheKey, JSON.stringify(foods), 'EX', 3600);
  res.json(foods);
});

app.post('/api/nutrition/foods', authenticateToken, async (req: any, res) => {
  const foodData = req.body;
  const newFood = await addFood(foodData);
  res.json(newFood);
});

// Resumen nutricional
app.get('/api/nutrition/summary', authenticateToken, async (req: any, res) => {
  const patientId = req.user.id;
  const { startDate, endDate } = req.query;
  
  const summary = await getNutritionSummary(patientId, { startDate, endDate });
  res.json(summary);
});