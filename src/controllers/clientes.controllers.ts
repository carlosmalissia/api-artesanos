import { Request, Response } from "express";
import Orden from "../models/Orden";
import Usuario from "../models/Usuario";
import mongoose from "mongoose";

export const getClientes = async (req: Request, res: Response) => {
  try {
    const userId = req.usuario!.id;
    const roles = req.usuario!.roles;

    // 👑 ADMIN → todos los compradores
    if (roles.includes("admin")) {
      const clientes = await Usuario.find({
        roles: "comprador",
      }).select("-password");

      return res.json(clientes);
    }

    // 🛒 VENDEDOR → solo clientes con órdenes asociadas
    if (roles.includes("vendedor")) {
      const ordenes = await Orden.find({
        vendedor: new mongoose.Types.ObjectId(userId),
      }).select("comprador");

      const compradoresIds = [
        ...new Set(
          ordenes.map((orden) => orden.comprador.toString())
        ),
      ];

      const clientes = await Usuario.find({
        _id: { $in: compradoresIds },
      }).select("-password");;

      return res.json(clientes);
    }

    return res.status(403).json({ message: "No autorizado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};