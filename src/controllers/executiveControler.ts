import { Request, Response } from 'express';
import Orden from '../models/Orden';
import Usuario from '../models/Usuario';

export const getExecutiveStats = async (req: Request, res: Response) => {
  try {
    if (!req.usuario?.roles.includes('OWNER')) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // 🔹 Ventas totales
    const ventasAgg = await Orden.aggregate([
      { $group: { _id: null, total: { $sum: '$precioTotal' } } },
    ]);

    const totalVentas = ventasAgg[0]?.total || 0;

    // 🔹 Ingresos por comisión
    const comisionesAgg = await Orden.aggregate([
      { $group: { _id: null, total: { $sum: '$montoComision' } } },
    ]);

    const ingresosComisiones = comisionesAgg[0]?.total || 0;

    // 🔹 Ingresos por suscripción (por ahora 0)
    const ingresosSuscripciones = 0;

    const ingresosTotales = ingresosComisiones + ingresosSuscripciones;

    const totalOrdenes = await Orden.countDocuments();

    const totalVendedores = await Usuario.countDocuments({
      roles: { $in: ['VENDEDOR'] },
    });

    const totalClientes = await Usuario.countDocuments({
      roles: { $in: ['CLIENTE'] },
    });

    res.json({
      ventas: totalVentas,
      ingresos: {
        comisiones: ingresosComisiones,
        suscripciones: ingresosSuscripciones,
        total: ingresosTotales,
      },
      metricas: {
        ordenes: totalOrdenes,
        vendedores: totalVendedores,
        clientes: totalClientes,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
};

export const getSalesByMonth = async (req: Request, res: Response) => {
  try {
    if (!req.usuario?.roles.includes('OWNER')) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const ventasPorMes = await Orden.aggregate([
      {
        $match: {
          fechaCreacion: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$fechaCreacion' },
            month: { $month: '$fechaCreacion' },
          },
          totalVentas: { $sum: '$precioTotal' },
          totalComisiones: { $sum: '$montoComision' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalVentas: 1,
          totalComisiones: 1,
        },
      },
    ]);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Mongo month es 1-12
    const today = now.getDate();

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    let isCurrentMonth = false;
    let monthCompletionPercentage = null;
    let projectedVentas = null;
    let projectedComisiones = null;

    if (ventasPorMes.length > 0) {
      const lastMonthData = ventasPorMes[ventasPorMes.length - 1];
      const isLastDayOfMonth = today === daysInMonth;

      if (
        lastMonthData.year === currentYear &&
        lastMonthData.month === currentMonth &&
        !isLastDayOfMonth
      ) {
        isCurrentMonth = true;

        monthCompletionPercentage = Math.round((today / daysInMonth) * 100);

        const dailyRateVentas = lastMonthData.totalVentas / today;

        const dailyRateComisiones = lastMonthData.totalComisiones / today;

        projectedVentas = Math.round(dailyRateVentas * daysInMonth);
        projectedComisiones = Math.round(dailyRateComisiones * daysInMonth);
      }
    }

    res.json({
      data: ventasPorMes,
      meta: {
        isCurrentMonth,
        monthCompletionPercentage,
        projectedVentas,
        projectedComisiones,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo ventas mensuales' });
  }
};
//export const getTopVendedores.....a futuro
