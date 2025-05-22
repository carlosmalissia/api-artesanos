import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes';
import authRoutes from './routes/authRoutes';
import productoRoutes from './routes/productoRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import ordenRoutes from './routes/ordenRoutes';
import imageRoutes from './routes/imageRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // tu frontend
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/images', imageRoutes);

// Ruta base
app.get('/', (_req, res) => {
  res.send('API Artesanos funcionando');
});

export default app;
