import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 5000,
  family: 4,
})
.then(() => {
  console.log("✅ SOLO MONGOOSE CONECTÓ");
  process.exit(0);
})
.catch(err => {
  console.error("❌ SOLO MONGOOSE FALLÓ", err);
  process.exit(1);
});

