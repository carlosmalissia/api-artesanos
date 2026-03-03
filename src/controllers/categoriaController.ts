import { Request, Response } from 'express';
import Categoria from '../models/Categoria';
import Producto from '../models/Producto';

export const obtenerCategoriasPublicas = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const filtro: any = { activa: true };

    if (search && typeof search === 'string') {
      filtro.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const categorias = await Categoria.find(filtro)
      .select('_id nombre slug parent activa orden')
      .sort({ orden: 1, nombre: 1 })
      .lean();

    res.json(categorias);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const obtenerCategoriasAdmin = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const filtro: any = {};

    if (search && typeof search === 'string') {
      filtro.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const categorias = await Categoria.find(filtro)
      .select('_id nombre slug parent activa orden')
      .sort({ orden: 1, nombre: 1 })
      .lean();

    res.json(categorias);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const obtenerCategoriasArbol = async (req: Request, res: Response) => {
  try {
    const roles = req.usuario?.roles || [];

    const esAdmin = roles.includes('ADMIN') || roles.includes('OWNER');
    const filtro: any = {};

    if (!esAdmin) {
      filtro.activa = true;
    }

    const categorias = await Categoria.find(filtro)
      .select('_id nombre slug parent activa orden')
      .sort({ orden: 1, nombre: 1 }) // 🔥 AQUÍ VA
      .lean();

    const categoriasRaiz = categorias.filter((cat) => !cat.parent);
    const subcategorias = categorias.filter((cat) => cat.parent);

    const arbol = categoriasRaiz.map((raiz) => {
      const children = subcategorias.filter(
        (sub) => sub.parent?.toString() === raiz._id.toString()
      );

      return {
        ...raiz,
        children,
      };
    });

    res.json(arbol);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const obtenerImpactoCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productos = await Producto.find({
      categoriaId: id,
      isDeleted: false, // 👈 importante
    })
      .select('vendedorId')
      .lean();

    const productosActivos = productos.length;

    const vendedoresUnicos = new Set(productos.map((p) => p.vendedorId?.toString()));

    const vendedoresAfectados = vendedoresUnicos.size;

    res.json({
      productosActivos,
      vendedoresAfectados,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const crearCategoria = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, parent, orden } = req.body;

    const existeOrden = await Categoria.findOne({
      parent: parent || null,
      orden: orden ?? 0,
    });

    if (existeOrden) {
      return res.status(400).json({
        message: 'Ya existe una categoría con ese orden en este nivel',
      });
    }

    if (parent) {
      const categoriaPadre = await Categoria.findById(parent);

      if (!categoriaPadre) {
        return res.status(400).json({ message: 'Categoría padre no existe' });
      }

      if (!categoriaPadre.activa) {
        return res
          .status(400)
          .json({ message: 'No se puede usar una categoría inactiva como padre' });
      }

      if (categoriaPadre.parent) {
        return res.status(400).json({
          message: 'No se permiten más de 2 niveles de categorías',
        });
      }
    }

    const nuevaCategoria = new Categoria({
      nombre,
      descripcion,
      parent: parent || null,
    });

    await nuevaCategoria.save();

    res.status(201).json(nuevaCategoria);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Ver si se necesita, puede que no

/* export const getCategoriaById = async (req: Request, res: Response) => {
  const categoria = await Categoria.findById(req.params.id);
  if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
  res.json(categoria);
}; */

export const actualizarCategoria = async (req: Request, res: Response) => {
  try {
    const { parent, orden, activa } = req.body;
    const categoriaId = req.params.id;

    const existeOrden = await Categoria.findOne({
      parent: parent || null,
      orden: orden,
      _id: { $ne: categoriaId },
    });

    if (existeOrden) {
      return res.status(400).json({
        message: 'Ya existe una categoría con ese orden en este nivel',
      });
    }

    const categoriaActual = await Categoria.findById(categoriaId);
    if (!categoriaActual) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // 1️⃣ No puede ser su propio padre
    if (parent && parent.toString() === categoriaId.toString()) {
      return res.status(400).json({
        message: 'Una categoría no puede ser su propio padre',
      });
    }

    // 2️⃣ Validación de nuevo padre
    if (parent) {
      const categoriaPadre = await Categoria.findById(parent);

      if (!categoriaPadre) {
        return res.status(400).json({ message: 'Categoría padre no existe' });
      }

      if (!categoriaPadre.activa) {
        return res.status(400).json({ message: 'Categoría padre inactiva' });
      }

      if (categoriaPadre.parent) {
        return res.status(400).json({
          message: 'No se permiten más de 2 niveles',
        });
      }

      // 3️⃣ Si la actual tiene hijos, no puede volverse subcategoría
      const tieneHijos = await Categoria.exists({ parent: categoriaId });
      if (tieneHijos) {
        return res.status(400).json({
          message: 'No se puede convertir en subcategoría porque tiene subcategorías asociadas',
        });
      }
    }

    // 4️⃣ No permitir desactivar si tiene hijos
    if (activa === false) {
      const tieneHijos = await Categoria.exists({ parent: categoriaId });
      if (tieneHijos) {
        return res.status(400).json({
          message: 'No se puede desactivar una categoría con subcategorías',
        });
      }

      // 5️⃣ No permitir desactivar si tiene productos
      const tieneProductos = await Producto.exists({ categoria: categoriaId });
      if (tieneProductos) {
        return res.status(400).json({
          message: 'No se puede desactivar una categoría con productos asociados',
        });
      }
    }

    const categoriaActualizada = await Categoria.findByIdAndUpdate(categoriaId, req.body, {
      new: true,
    });

    res.json(categoriaActualizada);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findById(id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    categoria.activa = !categoria.activa;
    await categoria.save();

    res.json(categoria);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Decision por ahora de no poder borrarlas solo desactivarlas

/* export const deleteCategoria = async (req: Request, res: Response) => {
  const categoria = await Categoria.findByIdAndDelete(req.params.id);
  if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
  res.json({ message: 'Categoría eliminada' });
}; */
