import * as mongoose from "mongoose";
import * as dotenv from "dotenv";

// Force load .env.dev to test what the app uses
dotenv.config({ path: ".env.dev" });

async function checkConnection() {
  const url = process.env.MONGO_URL;
  console.log(`Intentando conectar a: ${url}`);

  try {
    await mongoose.connect(url);
    console.log("✅ CONEXIÓN EXITOSA a tu Mongo Local!");
    console.log("   (Usando credenciales locales definidas en docker-compose)");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error conectando:", error.message);
  }
}

checkConnection();
