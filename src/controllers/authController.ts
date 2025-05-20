import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';

dotenv.config();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ email });
  if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

  const esValido = await bcrypt.compare(password, usuario.password);
  if (!esValido) return res.status(401).json({ message: 'Contraseña incorrecta' });

  if (!usuario.nombre) {
    return res.status(400).json({
      message: 'Falta el nombre del usuario. Este campo es obligatorio.',
    });
  }

  const tokenPayload: any = {
    id: usuario._id,
    rol: usuario.rol,
    nombre: usuario.nombre,
  };

  if (usuario.avatar) {
    tokenPayload.avatar = usuario.avatar;
  }

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  const usuarioSinPassword = usuario.toObject() as { [key: string]: any };
  delete usuarioSinPassword.password;

  res.json({ token, usuario: usuarioSinPassword });
};
