import mongoose from "mongoose"

const imagenSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        hash: { type: String, required: true, unique: true },
    },
    { timestamps: true }
)

export default mongoose.model("Imagen", imagenSchema)