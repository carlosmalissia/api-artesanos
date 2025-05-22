import { Request, Response } from 'express';
import Producto from '../models/Producto';

export const getProductos = async (_req: Request, res: Response) => {
  try {
    const productos = await Producto.find()
      .populate('vendedorId', 'nombre email avatar') // Podés especificar campos
      .populate('categoriaId', 'nombre'); // Por ejemplo, solo el nombre de la categoría
    if (productos.length === 0) {
      return res.status(200).json({ message: 'No hay productos cargados aún', productos: [] });
    }
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error });
  }
};

export const createProducto = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, precio, stock, categoriaId, image } = req.body;

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      stock,
      image,
      categoriaId,
      vendedorId: req.usuario?.id, // 👈 acá es donde se usa el ID del token
    });

    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: "Error al crear producto" });
  }
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
