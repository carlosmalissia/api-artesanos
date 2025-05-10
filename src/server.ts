import app from './app';
import { conectarDB } from './config/db';

const PORT = process.env.PORT || 5000;

conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
});
