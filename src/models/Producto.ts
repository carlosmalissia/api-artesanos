import mongoose, { Schema, Document } from 'mongoose';

export interface IProducto extends Document {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  image: string;
  vendedor: mongoose.Schema.Types.ObjectId;
  categoria: mongoose.Schema.Types.ObjectId;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const ProductoSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true },
    image: { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);

export default mongoose.model<IProducto>('Producto', ProductoSchema);
