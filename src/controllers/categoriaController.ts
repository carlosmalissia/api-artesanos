import { Request, Response } from 'express';
import Categoria from '../models/Categoria';

export const getCategorias = async (_req: Request, res: Response) => {
  const categorias = await Categoria.find();
  res.json(categorias);
};

export const createCategoria = async (req: Request, res: Response) => {
  const nuevaCategoria = new Categoria(req.body);
  await nuevaCategoria.save();
  res.status(201).json(nuevaCategoria);
};

export const getCategoriaById = async (req: Request, res: Response) => {
  const categoria = await Categoria.findById(req.params.id);
  if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
  res.json(categoria);
};

export const updateCategoria = async (req: Request, res: Response) => {
  const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
  res.json(categoria);
};

export const deleteCategoria = async (req: Request, res: Response) => {
  const categoria = await Categoria.findByIdAndDelete(req.params.id);
  if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
  res.json({ message: 'Categoría eliminada' });
};
