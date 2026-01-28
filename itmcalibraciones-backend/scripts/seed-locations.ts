import * as mongoose from "mongoose";
import { StateSchema } from "../src/city/schemas/state.schema";
import { CitySchema } from "../src/city/schemas/city";

const statesData = require("./itm.states.json");
const citiesData = require("./itm.cities.json");

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/itm";

mongoose.set('strictQuery', false);

const StateModel = mongoose.model("State", StateSchema);
const CityModel = mongoose.model("City", CitySchema);

async function seedLocations() {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Conectado a MongoDB");

    // Limpiar colecciones existentes (opcional - comentar si no quieres borrar)
    console.log("🗑️  Limpiando colecciones existentes...");
    await StateModel.deleteMany({});
    await CityModel.deleteMany({});
    console.log("✅ Colecciones limpiadas");

    // Insertar provincias
    console.log("📍 Insertando provincias...");
    const statesMap = new Map();

    for (const state of statesData) {
      const newState = await StateModel.create({
        _id: new mongoose.Types.ObjectId(state._id.$oid),
        nombre: state.nombre,
      });
      statesMap.set(state._id.$oid, newState._id);
      console.log(`  ✓ ${state.nombre}`);
    }
    console.log(`✅ ${statesData.length} provincias insertadas`);

    // Insertar ciudades
    console.log("🏙️  Insertando ciudades...");
    for (const city of citiesData) {
      await CityModel.create({
        _id: new mongoose.Types.ObjectId(city._id.$oid),
        name: city.name,
        state: new mongoose.Types.ObjectId(city.state.$oid),
        createdAt: new Date(city.createdAt.$date),
        updatedAt: new Date(city.updatedAt.$date),
      });
      console.log(`  ✓ ${city.name} (${city.state.$oid})`);
    }
    console.log(`✅ ${citiesData.length} ciudades insertadas`);

    console.log("\n🎉 Seed completado exitosamente!");
    console.log(`\n📊 Resumen:`);
    console.log(`   - Provincias: ${statesData.length}`);
    console.log(`   - Ciudades: ${citiesData.length}`);
  } catch (error) {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Conexión cerrada");
    process.exit(0);
  }
}

seedLocations();
