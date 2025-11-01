// auth-service/src/app.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { connectToCouchbase } from '../../shared/couchbase';
import { redisClient } from '../../shared/redis';

const app = express();
app.use(express.json());

// Middleware para XML
app.use(express.raw({ type: 'application/xml' }));
app.use((req, res, next) => {
  if (req.is('application/xml')) {
    try {
      req.body = parseXml(req.body.toString());
    } catch (error) {
      return res.status(400).json({ error: 'XML inválido' });
    }
  }
  next();
});

// Login para doctores y pacientes
app.post('/api/auth/login', async (req, res) => {
  const { email, password, tipo } = req.body;
  
  let user;
  if (tipo === 'doctor') {
    user = await verifyDoctorCredentials(email, password);
  } else {
    user = await verifyPatientCredentials(email, password);
  }
  
  if (user) {
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        tipo: tipo || 'patient',
        nombre: user.nombre 
      }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    );
    
    await redisClient.set(`token:${token}`, JSON.stringify(user), 'EX', 86400);
    
    res.json({ token, user });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Verificar token
app.get('/api/auth/verify', authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req: any, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  await redisClient.del(`token:${token}`);
  res.json({ message: 'Sesión cerrada' });
});