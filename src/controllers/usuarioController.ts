import { Request, Response } from 'express';
import Usuario from '../models/Usuario';
import Orden from '../models/Orden';

export const getUsuarios = async (req: Request, res: Response) => {
  if (req.usuario?.roles?.includes('vendedor')) {

    const ordenes = await Orden.find({
      vendedor: req.usuario.id
    }).select('comprador');

    const compradoresIds = ordenes.map((o) =>
      o.comprador.toString()
    );

    const compradoresUnicos = [...new Set(compradoresIds)];

    const compradores = await Usuario.find({
      _id: { $in: compradoresUnicos }
    }).select('-password');

    return res.json(compradores);

  } else {

    const usuarios = await Usuario.find().select('-password');
    return res.json(usuarios);

  }
};

export const createUsuario = async (req: Request, res: Response) => {
  const { nombre, email, roles, avatar, password } = req.body;

  const existe = await Usuario.findOne({ email });
  if (existe) {
    return res.status(400).json({ message: 'El correo ya está registrado' });
  }

  const nuevoUsuario = new Usuario({
    nombre,
    email,
    roles: roles && roles.length ? roles : ['comprador'],
    avatar,
    password
  });

  await nuevoUsuario.save();

  const usuarioSinPassword = nuevoUsuario.toObject() as any;
  delete usuarioSinPassword.password;

  res.status(201).json(usuarioSinPassword);
};

export const getUsuarioById = async (req: Request, res: Response) => {
  const usuario = await Usuario.findById(req.params.id).select('-password');
  if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(usuario);
};

export const updateUsuario = async (req: Request, res: Response) => {
  const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(usuario);
};

export const deleteUsuario = async (req: Request, res: Response) => {
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ message: 'Usuario eliminado' });
};
