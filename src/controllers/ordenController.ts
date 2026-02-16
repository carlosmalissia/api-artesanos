import { Request, Response } from 'express';
import Orden from '../models/Orden';

import mongoose from "mongoose";

export const getOrdenes = async (req: Request, res: Response) => {
  const filtro =
    req.usuario?.rol === "vendedor"
      ? { vendedor: new mongoose.Types.ObjectId(req.usuario.id) }
      : {};

  const ordenes = await Orden.find(filtro)
    .populate("productos.producto")
    .populate("comprador vendedor");

  console.log("FILTRO:", filtro);
  console.log("ORDENES ENCONTRADAS:", ordenes.length);
  const todas = await Orden.find();
console.log("TODAS LAS ORDENES:", todas);

  res.json(ordenes);
};


export const createOrden = async (req: Request, res: Response) => {
  const nuevaOrden = new Orden(req.body);
  await nuevaOrden.save();
  res.status(201).json(nuevaOrden);
};

export const getOrdenById = async (req: Request, res: Response) => {
  const orden = await Orden.findById(req.params.id).populate('productos.producto').populate('comprador vendedor');
  if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });

  if (req.usuario?.rol === 'vendedor' && orden.vendedor.toString() !== req.usuario.id) {
    return res.status(403).json({ message: 'No autorizado para ver esta orden' });
  }

  res.json(orden);
};

export const deleteOrden = async (req: Request, res: Response) => {
  const orden = await Orden.findByIdAndDelete(req.params.id);
  if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
  res.json({ message: 'Orden eliminada' });
};
