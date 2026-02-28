import { Request, Response } from 'express';
import Orden from '../models/Orden';
import Producto from '../models/Producto';
import Usuario from '../models/Usuario';
import mongoose, { Types } from 'mongoose';

// 🔹 GET ORDENES
export const getOrdenes = async (req: Request, res: Response) => {
  const userId = req.usuario!.id;
  const roles = req.usuario!.roles; // ["OWNER"] etc

  let filtro: any = {};

  if (roles.includes('OWNER') || roles.includes('ADMIN')) {
    filtro = {};
  } else if (roles.includes('VENDEDOR')) {
    filtro = { vendedor: new mongoose.Types.ObjectId(userId) };
  } else if (roles.includes('CLIENTE')) {
    filtro = { cliente: new mongoose.Types.ObjectId(userId) };
  }

  const ordenes = await Orden.find(filtro)
    .populate('productos.producto')
    .populate('cliente vendedor');

  res.json(ordenes);
};

// 🔹 CREATE ORDEN
export const createOrden = async (req: Request, res: Response) => {
  try {
    const { cliente, productos } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ message: 'Debe agregar al menos un producto' });
    }

    const vendedorId = req.usuario!.id;
    // ⚠️ Por ahora el vendedor crea la orden manualmente (después cambiaremos flujo)

    const vendedorDB = await Usuario.findById(vendedorId);

    if (!vendedorDB || !vendedorDB.roles.includes('VENDEDOR')) {
      return res.status(404).json({ message: 'Vendedor no válido' });
    }

    // 🔹 Generar número de factura
    vendedorDB.numeroFacturaActual = (vendedorDB.numeroFacturaActual || 0) + 1;

    const numeroFacturaGenerado = `${vendedorId
      .toString()
      .slice(-4)}-${String(vendedorDB.numeroFacturaActual).padStart(5, '0')}`;

    await vendedorDB.save();

    // 🔹 Procesar productos
    let precioTotal = 0;

    const productosProcesados = await Promise.all(
      productos.map(async (item: any) => {
        const productoDB = await Producto.findById(item.producto);

        if (!productoDB) {
          throw new Error('Producto no encontrado');
        }

        const subtotal = productoDB.precio * item.cantidad;
        precioTotal += subtotal;

        return {
          producto: productoDB._id,
          cantidad: item.cantidad,
          precioUnitario: productoDB.precio,
          subtotal,
        };
      })
    );

    // 🔥 🔥 🔥 NUEVA LÓGICA DE COMISIÓN

    const porcentaje = vendedorDB.porcentajeComision ?? 10;

    const montoComision = precioTotal * (porcentaje / 100);
    const ingresoVendedor = precioTotal - montoComision;

    const nuevaOrden = new Orden({
      numeroFactura: numeroFacturaGenerado,
      cliente,
      vendedor: vendedorId,
      productos: productosProcesados,
      precioTotal,
      porcentajeComisionAplicado: porcentaje,
      montoComision,
      ingresoVendedor,
      estado: 'pendiente',
    });

    await nuevaOrden.save();

    res.status(201).json(nuevaOrden);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la orden' });
  }
};

// 🔹 GET ORDEN BY ID
export const getOrdenById = async (req: Request, res: Response) => {
  const orden = await Orden.findById(req.params.id)
    .populate('productos.producto')
    .populate('cliente vendedor')
    .lean();

  if (!orden) {
    return res.status(404).json({ message: 'Orden no encontrada' });
  }

  const userId = req.usuario!.id;
  const roles = req.usuario!.roles;

  if (roles.includes('VENDEDOR')) {
    const vendedorId =
      orden.vendedor instanceof Types.ObjectId
        ? orden.vendedor.toString()
        : orden.vendedor._id.toString();

    if (vendedorId !== userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }
  }

  if (roles.includes('CLIENTE')) {
    const clienteId =
      orden.cliente instanceof Types.ObjectId
        ? orden.cliente.toString()
        : orden.cliente._id.toString();

    if (clienteId !== userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }
  }

  res.json(orden);
};

// 🔹 DELETE ORDEN
export const deleteOrden = async (req: Request, res: Response) => {
  const orden = await Orden.findByIdAndDelete(req.params.id);

  if (!orden) {
    return res.status(404).json({ message: 'Orden no encontrada' });
  }

  res.json({ message: 'Orden eliminada' });
};
