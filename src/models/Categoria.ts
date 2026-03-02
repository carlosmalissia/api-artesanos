import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface ICategoria extends Document {
  nombre: string;
  slug: string;
  descripcion?: string;
  parent?: mongoose.Types.ObjectId | null;
  activa: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const CategoriaSchema: Schema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
      sparse: true, // 🔥 importante para no romper datos viejos
    },

    descripcion: {
      type: String,
    },

    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Categoria',
      default: null,
      index: true,
    },

    activa: {
      type: Boolean,
      default: true,
    },
    orden: {
      type: Number,
      default: 0,
      index: true,
    },
  },

  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion',
    },
  }
);

CategoriaSchema.pre<ICategoria>('save', function (next) {
  if (this.isModified('nombre')) {
    this.slug = slugify(this.nombre, {
      lower: true,
      strict: true,
      locale: 'es',
    });
  }
  next();
});
// Índices
CategoriaSchema.index({ slug: 1 });
CategoriaSchema.index({ parent: 1 });
CategoriaSchema.index({ parent: 1, orden: 1 }, { unique: true });

export default mongoose.model<ICategoria>('Categoria', CategoriaSchema);
