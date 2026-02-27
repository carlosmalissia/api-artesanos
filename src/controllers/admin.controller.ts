import { Request, Response } from 'express';
import Usuario from '../models/Usuario';

export const getVendorsWithMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendors = await Usuario.aggregate([
      // Solo vendedores (roles es array)
      { $match: { roles: 'vendedor' } },

      // Lookup órdenes
      {
        $lookup: {
          from: 'ordens', // nombre real de la colección
          localField: '_id',
          foreignField: 'vendedor',
          as: 'orders',
        },
      },

      // Lookup productos
      {
        $lookup: {
          from: 'productos', // nombre real
          localField: '_id',
          foreignField: 'vendedorId',
          as: 'products',
        },
      },

      // Métricas
      {
        $addFields: {
          totalOrdenes: { $size: '$orders' },
          totalProductos: { $size: '$products' },
          totalVendido: {
            $sum: '$orders.precioTotal',
          },
        },
      },
      {
        $addFields: {
          comisionPlataforma: {
            $round: [{ $multiply: ['$totalVendido', 0.1] }, 2],
          },
          gananciaVendedor: {
            $round: [{ $multiply: ['$totalVendido', 0.9] }, 2],
          },
        },
      },
      // Ocultar datos innecesarios
      {
        $project: {
          password: 0,
          orders: 0,
          products: 0,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    res.status(500).json({ message: 'Error obteniendo métricas de vendedores' });
  }
};
