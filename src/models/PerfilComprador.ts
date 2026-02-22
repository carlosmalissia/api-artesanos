import mongoose, { Schema, Document } from "mongoose";

export interface IPerfilComprador extends Document {
  usuario: mongoose.Types.ObjectId;

  direccionEnvio: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    pais: string;
  };

  telefono?: string;

  tipoContribuyente: "Consumidor Final" | "Monotributista" | "Responsable Inscripto";

  razonSocial?: string;
  cuit?: string;

  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const PerfilCompradorSchema: Schema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true, // 🔥 CLAVE: 1 perfil por usuario
    },

    direccionEnvio: {
      calle: { type: String, default: "" },
      numero: { type: String, default: "" },
      ciudad: { type: String, default: "" },
      provincia: { type: String, default: "" },
      codigoPostal: { type: String, default: "" },
      pais: { type: String, default: "Argentina" },
    },

    telefono: { type: String },

    tipoContribuyente: {
      type: String,
      enum: ["Consumidor Final", "Monotributista", "Responsable Inscripto"],
      default: "Consumidor Final",
    },

    razonSocial: { type: String },
    cuit: { type: String },
  },
  {
    timestamps: {
      createdAt: "fechaCreacion",
      updatedAt: "fechaActualizacion",
    },
  }
);

export default mongoose.model<IPerfilComprador>(
  "PerfilComprador",
  PerfilCompradorSchema
);