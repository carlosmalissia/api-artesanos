import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  roles: ('OWNER' | 'ADMIN' | 'VENDEDOR' | 'CLIENTE')[];
  avatar?: string;
  password: string;
  porcentajeComision: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  numeroFacturaActual?: number;
}

const UsuarioSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    roles: {
      type: [String],
      enum: ['OWNER', 'ADMIN', 'VENDEDOR', 'CLIENTE'],
      default: ['CLIENTE'],
      required: true,
    },
    tipoPlan: {
      type: String,
      enum: ['COMISION', 'SUSCRIPCION', 'MIXTO'],
      default: 'COMISION',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: { type: String },
    password: { type: String, required: true },
    numeroFacturaActual: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);

UsuarioSchema.pre<IUsuario>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);
