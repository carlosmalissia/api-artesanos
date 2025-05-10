import mongoose, { Schema, Document } from 'mongoose';

interface ProductoOrdenado {
  producto: mongoose.Schema.Types.ObjectId;
  cantidad: number;
}

export interface IOrden extends Document {
  numeroFactura: string;
  productos: ProductoOrdenado[];
  comprador: mongoose.Schema.Types.ObjectId;
  vendedor: mongoose.Schema.Types.ObjectId;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const OrdenSchema: Schema = new Schema(
  {
    numeroFactura: { type: String, required: true, unique: true },
    productos: [
      {
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
        cantidad: { type: Number, required: true },
      },
    ],
    comprador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);

export default mongoose.model<IOrden>('Orden', OrdenSchema);
