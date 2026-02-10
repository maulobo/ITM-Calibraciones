import * as mongoose from "mongoose";
import * as XLSX from "xlsx";
import * as path from "path";
import { BrandSchema } from "../src/brands/schemas/brand.schema";
import { EquipmentTypesSchema } from "../src/equipment-types/schemas/equipment-types.schema";
import { ModelSchema } from "../src/models/schemas/model.schema";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/itm";

mongoose.set("strictQuery", false);

async function importCatalog() {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Conectado a MongoDB");

    // Register Models
    // Note: The names must match the 'ref' used in Schema definitions
    const BrandModel = mongoose.model("Brand", BrandSchema);
    const EquipmentTypesModel = mongoose.model(
      "EquipmentTypes",
      EquipmentTypesSchema,
    );
    const ModelModel = mongoose.model("Model", ModelSchema);

    // Read File
    const filePath = path.join(__dirname, "catalogo.xlsx");
    console.log(`📂 Leyendo archivo: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON (array of arrays)
    // header: 1 returns an array of arrays [ [A1, B1, ...], [A2, B2, ...] ]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length <= 1) {
      console.log("⚠️ El archivo parece vacío o solo tiene cabeceras.");
      return;
    }

    console.log(`📊 Procesando ${data.length - 1} filas...`);

    // Skip header (row 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as string[];
      if (!row || row.length === 0) continue;

      // Col 1: Equipo (Type), Col 2: Marca (Brand), Col 3: Modelo (Model)
      // Using trim() to clean inputs
      const equipmentTypeName = row[0] ? String(row[0]).trim() : null;
      const brandName = row[1] ? String(row[1]).trim() : null;
      const modelName = row[2] ? String(row[2]).trim() : null;

      if (!equipmentTypeName || !brandName || !modelName) {
        console.log(
          `⚠️  Fila ${i + 1} incompleta: ${JSON.stringify(row)}. Saltando...`,
        );
        continue;
      }

      // 1. Equipment Type (Product)
      let equipType = await EquipmentTypesModel.findOne({
        type: equipmentTypeName,
      });
      if (!equipType) {
        equipType = await EquipmentTypesModel.create({
          type: equipmentTypeName,
        });
        console.log(`  ✅ Created EquipmentType: ${equipmentTypeName}`);
      }

      // 2. Brand
      let brand = await BrandModel.findOne({ name: brandName });
      if (!brand) {
        // If brand doesn't exist, create it
        brand = await BrandModel.create({ name: brandName });
        console.log(`  ✅ Created Brand: ${brandName}`);
      }

      // 3. Model
      let model = await ModelModel.findOne({
        name: modelName,
        brand: brand._id,
      });

      // If model is not found by name and brand, create it.
      // Note: We also link to equipmentType.
      // If a model with same name exists for same brand but different equipmentType,
      // we typically assume Model Names are unique per Brand.
      // However, let's just check uniqueness by (Name + Brand).

      if (!model) {
        model = await ModelModel.create({
          name: modelName,
          brand: brand._id,
          equipmentType: equipType._id,
        });
        console.log(`  ✅ Created Model: ${modelName} (Brand: ${brandName})`);
      } else {
        // Determine if we need to update anything?
        // Maybe the equipmentType is different?
        // For now, let's assume if it exists, it's fine.
        // Or verify if equipmentType matches?
        if (
          model.equipmentType &&
          model.equipmentType.toString() !== equipType._id.toString()
        ) {
          console.log(
            `  ⚠️  Model ${modelName} exists but with different EquipmentType. Existing: ${model.equipmentType}, New: ${equipType._id}`,
          );
        }
      }
    }

    console.log("🎉 Importación finalizada con éxito.");
  } catch (error) {
    console.error("❌ Error importando catálogo:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Desconectado de MongoDB");
  }
}

importCatalog();
