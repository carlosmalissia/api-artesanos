import { Request, Response } from 'express';
import Producto from '../models/Producto';

export const getProductos = async (_req: Request, res: Response) => {
  const productos = await Producto.find().populate('vendedor').populate('categoria');
  res.json(productos);
};

export const createProducto = async (req: Request, res: Response) => {
  const nuevoProducto = new Producto(req.body);
  await nuevoProducto.save();
  res.status(201).json(nuevoProducto);
};

export const getProductoById = async (req: Request, res: Response) => {
  const producto = await Producto.findById(req.params.id).populate('vendedor').populate('categoria');
  if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json(producto);
};

export const updateProducto = async (req: Request, res: Response) => {
  const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json(producto);
};

export const deleteProducto = async (req: Request, res: Response) => {
  const producto = await Producto.findByIdAndDelete(req.params.id);
  if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json({ message: 'Producto eliminado' });
};
