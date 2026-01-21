import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app.module";
import { ClientService } from "./src/clients/clients.service";
import { UsersService } from "./src/users/users.service";
import { UserRoles } from "./src/common/enums/role.enum";
import { OfficeService } from "./src/offices/office.service";
import { Types } from "mongoose";
import * as bcrypt from "bcrypt";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const clientsService = app.get(ClientService);
  const usersService = app.get(UsersService);
  const officesService = app.get(OfficeService); // Need office for User

  console.log("🚀 Iniciando Seed: Cliente & Usuario Fénix...");

  try {
    // 0. Mock Data
    const CUIT = "30-11223344-5";
    const EMAIL = "cliente@fenix.com";
    const TEST_PASSWORD = `${CUIT.replace(/-/g, "")}itm`; // "30112233445itm"
    const CONTACT_NAME = "Admin Fénix";

    // 1. Get Office (ITM Default or First Available)
    // We need a valid office ID to create a user, as per schema
    const offices = await officesService.getAllOffices(null); // Assuming find all
    const mainOffice =
      offices.length > 0 ? offices[0]._id : new Types.ObjectId(); // Fallback if empty (should not verify ref strictly in seed if empty)

    if (offices.length === 0) {
      console.warn(
        "⚠️ No hay oficinas creadas. Se generará un ID aleatorio (puede fallar si hay ref estricta).",
      );
    } else {
      console.log(`🏢 Oficina asignada: ${offices[0].name}`);
    }

    // 2. Create/Get Client
    // Check if exists
    let client = await clientsService
      .getAllClients({ search: CUIT } as any)
      .then((res) => res[0]);

    if (!client) {
      console.log("🆕 Creando Cliente Fénix...");
      client = await clientsService.addClient({
        socialReason: "Empresa Fénix S.A.",
        cuit: CUIT,
        email: EMAIL,
        city: new Types.ObjectId().toString(), // Mock city id
        responsable: CONTACT_NAME,
        contacts: [
          {
            name: CONTACT_NAME,
            email: EMAIL,
            phone: "+5491112345678",
            role: "Administrador",
          },
        ],
      } as any);
      console.log("   ✅ Cliente Creado:", client._id);
    } else {
      console.log("   ℹ️ El Cliente ya existe:", client._id);
    }

    // 3. Create/Update User
    // Check if user exists
    let user = await usersService.findOne(EMAIL); // Or findUserByEmail logic

    // We manually need to hash password if we are using creates directly or use the service method if it handles it.
    // Looking at CreateUserHandler usually it handles hashing.
    // Let's use the usersService.addUser which triggers the Command.

    if (!user) {
      console.log(`🆕 Creando Usuario (${EMAIL})...`);

      const createdUser = await usersService.addUser({
        name: "Admin",
        lastName: "Fénix",
        email: EMAIL,
        password: TEST_PASSWORD, // The handler should hash this
        roles: [UserRoles.USER], // Client Role
        office: mainOffice.toString(),
        client: client._id.toString(), // Link the user to the client!
      } as any);

      console.log("   ✅ Usuario Creado!");
      console.log(`   🔑 Credenciales: ${EMAIL} / ${TEST_PASSWORD}`);
    } else {
      console.log("   ℹ️ El Usuario ya existe.");
      // Optional: Update client link if missing?
      // const userModel = app.get('UserModel'); // Harder to get model if not exported
      // console.log('   ⚠️ Si el usuario existente no tiene "client" linkeado, hazlo manualmente o borra el usuario.');
    }

    // summary
    console.log("\n--- Resumen Seed ---");
    console.log("Cliente:", client.socialReason);
    console.log("Usuario:", EMAIL);
    console.log("Pass:", TEST_PASSWORD);
    console.log("Link:", `User.client -> Client._id (${client._id})`);
  } catch (error) {
    console.error("❌ Error en Seed:", error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
