import mongoose, { Schema, Document } from 'mongoose';
import { IUsuario } from './Usuario';
import { Types } from 'mongoose';

interface ProductoOrdenado {
  producto: mongoose.Schema.Types.ObjectId;
  cantidad: number;
}

export interface IOrden extends Document {
  numeroFactura: string;
  productos: ProductoOrdenado[];
  cliente: Types.ObjectId | IUsuario;
  vendedor: Types.ObjectId | IUsuario;

  precioTotal: number;

  porcentajeComisionAplicado: number;
  montoComision: number;
  ingresoVendedor: number;

  estado: 'pendiente' | 'pagada';

  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const OrdenSchema: Schema = new Schema(
  {
    numeroFactura: { type: String, required: true },
    productos: [
      {
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
        cantidad: { type: Number, required: true },
        precioUnitario: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    precioTotal: { type: Number },
    porcentajeComisionAplicado: { type: Number, required: true },
    montoComision: { type: Number, required: true },
    ingresoVendedor: { type: Number, required: true },
    estado: { type: String, enum: ['pendiente', 'pagada'], default: 'pendiente' },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);
OrdenSchema.index({ vendedor: 1, numeroFactura: 1 }, { unique: true });

export default mongoose.model<IOrden>('Orden', OrdenSchema);
