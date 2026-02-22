import { Request, Response } from 'express';
import Orden from '../models/Orden';
import Producto from '../models/Producto';
import Usuario from "../models/Usuario";

import mongoose from "mongoose";
import { Types } from 'mongoose';

export const getOrdenes = async (req: Request, res: Response) => {
  const userId = req.usuario!.id;
  const roles = req.usuario!.roles;

  let filtro = {};

  if (roles.includes("admin")) {
    filtro = {};
  } else if (roles.includes("vendedor")) {
    filtro = { vendedor: new mongoose.Types.ObjectId(userId) };
  } else if (roles.includes("comprador")) {
    filtro = { comprador: new mongoose.Types.ObjectId(userId) };
  }

  const ordenes = await Orden.find(filtro)
    .populate("productos.producto")
    .populate("comprador vendedor");

  res.json(ordenes);
};

export const createOrden = async (req: Request, res: Response) => {
  try {
    const { comprador, productos } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ message: "Debe agregar al menos un producto" });
    }

    const vendedorId = req.usuario!.id; //Se asume que vendedor crea manualmente las ordenes, hay que cambiarlo mas adelante

    // 🔹 Generar número de factura automático
    const vendedorDB = await Usuario.findById(vendedorId);
    if (!vendedorDB) {
      return res.status(404).json({ message: "Vendedor no encontrado" });
    }

    vendedorDB.numeroFacturaActual =
      (vendedorDB.numeroFacturaActual || 0) + 1;

    const numeroFacturaGenerado = `${vendedorId
      .toString()
      .slice(-4)}-${String(vendedorDB.numeroFacturaActual).padStart(5, "0")}`;

    await vendedorDB.save();

    // 🔹 Procesar productos
    let precioTotal = 0;

    const productosProcesados = await Promise.all(
      productos.map(async (item: any) => {
        const productoDB = await Producto.findById(item.producto);

        if (!productoDB) {
          throw new Error("Producto no encontrado");
        }

        const subtotal = productoDB.precio * item.cantidad;
        precioTotal += subtotal;

        return {
          producto: productoDB._id,
          cantidad: item.cantidad,
          precioUnitario: productoDB.precio,
          subtotal
        };
      })
    );

    const nuevaOrden = new Orden({
      numeroFactura: numeroFacturaGenerado,
      comprador,
      vendedor: vendedorId,
      productos: productosProcesados,
      precioTotal,
      estado: "pendiente"
    });

    await nuevaOrden.save();

    res.status(201).json(nuevaOrden);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la orden" });
  }
};

export const getOrdenById = async (req: Request, res: Response) => {
  const orden = await Orden.findById(req.params.id)
    .populate('productos.producto')
    .populate('comprador vendedor');

  if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });

  const userId = req.usuario!.id;
  const roles = req.usuario!.roles;

if (roles.includes("vendedor")) {
  const vendedorId =
    orden.vendedor instanceof Types.ObjectId
      ? orden.vendedor.toString()
      : orden.vendedor._id.toString();

  if (vendedorId !== userId) {
    return res.status(403).json({ message: "No autorizado" });
  }
}

if (roles.includes("comprador")) {
  const compradorId =
    orden.comprador instanceof Types.ObjectId
      ? orden.comprador.toString()
      : orden.comprador._id.toString();

  if (compradorId !== userId) {
    return res.status(403).json({ message: "No autorizado" });
  }
}

  // 🔥 Agregamos subtotal calculado dinámicamente
  const ordenConSubtotales = {
    ...orden.toObject(),
    productos: orden.productos.map((item: any) => ({
      ...item,
      subtotal: item.precioUnitario * item.cantidad
    }))
  };

  res.json(ordenConSubtotales);
};

export const deleteOrden = async (req: Request, res: Response) => {
  const orden = await Orden.findByIdAndDelete(req.params.id);
  if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
  res.json({ message: 'Orden eliminada' });
};
