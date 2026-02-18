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
  comprador: Types.ObjectId | IUsuario;
 vendedor: Types.ObjectId | IUsuario;
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
        PrecioUnitario:{type: Number }
      },
    ],
    comprador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    precioTotal: {type: Number},
    estado: {type: String,enum:["pendiente", "pagada"], default:"pendiente"}
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);

export default mongoose.model<IOrden>('Orden', OrdenSchema);
