import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import { UserSchema } from "../src/users/schemas/user.schema";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/itm";

mongoose.set('strictQuery', false);

const UserModel = mongoose.model("User", UserSchema);

async function createAdminUser() {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Conectado a MongoDB");

    const email = "user@user.com";
    const password = "alal1010";

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.log("⚠️  El usuario ya existe. Eliminándolo...");
      await UserModel.deleteOne({ email });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario admin
    const adminUser = await UserModel.create({
      email,
      name: "Admin",
      lastName: "User",
      password: hashedPassword,
      roles: ["ADMIN", "TECHNICAL"],
      phoneNumber: "",
      area: "Administración",
      office: null, // Admin no necesita office obligatoriamente
    });

    console.log("✅ Usuario admin creado exitosamente!");
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 ID: ${adminUser._id}`);
    
  } catch (error) {
    console.error("❌ Error creando usuario admin:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Conexión cerrada");
    process.exit(0);
  }
}

createAdminUser();
