import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'usuario';
  avatar?: string;
  password: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const UsuarioSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    rol: { type: String, enum: ['admin', 'vendedor', 'usuario'], default: 'usuario' },
    avatar: { type: String },
    password: { type: String, required: true },
  },
  { timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' } }
);

// Hash password before saving
UsuarioSchema.pre<IUsuario>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);
