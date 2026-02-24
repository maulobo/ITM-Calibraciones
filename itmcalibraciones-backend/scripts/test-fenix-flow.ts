import * as mongoose from "mongoose";
import { ClientsSchema } from "../src/clients/schemas/clients.schema";
import {
  ServiceOrderSchema,
  ServiceOrderState,
} from "../src/service-orders/schemas/service-order.schema";
import { EquipmentSchema } from "../src/equipment/schemas/equipment.schema";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/itm";

mongoose.set("strictQuery", false);

// Definimos Modelos Temporales para el Script
const ClientModel = mongoose.model("Client", ClientsSchema);
const ServiceOrderModel = mongoose.model("ServiceOrder", ServiceOrderSchema);
const EquipmentModel = mongoose.model("Equipment", EquipmentSchema);

async function runTestScenario() {
  try {
    console.log("🔌 (1/6) Conectando a MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Conectado.");

    // --- LIMPIEZA PREVENTIVA ---
    console.log("🧹 Limpiando datos de pruebas anteriores...");
    await ClientModel.deleteOne({ socialReason: "TGS - TEST" });
    await ServiceOrderModel.deleteOne({ code: "OT-TEST-001" });
    await EquipmentModel.deleteMany({
      tag: { $in: ["MAN-TGS-01", "MAN-TGS-02"] },
    });

    // --- PASO 1: Crear Cliente con Contacto ---
    console.log("\n👤 (2/6) Creando Cliente 'TGS'...");

    // Creamos city dummy ID ya que es requerido
    const dummyCityId = new mongoose.Types.ObjectId();

    const newClient = await ClientModel.create({
      socialReason: "TGS - TEST",
      cuit: "30-99999999-9",
      email: "proveedores@tgs.com",
      city: dummyCityId, // Requerido por schema
      contacts: [
        {
          name: "Sergio", // Responsable de instrumentación
          email: "sergio@tgs.com",
          role: "Jefe Instrumentación",
          phone: "+54 9 11 5555 6666",
        },
        {
          name: "Emanuel", // Contacto de compras
          email: "emanuel@tgs.com",
          role: "Compras",
        },
      ],
    });
    console.log(`✅ Cliente creado. ID: ${newClient._id}`);

    // --- PASO 2: Crear Orden de Servicio (OT) ---
    console.log("\n📋 (3/6) Creando Orden de Servicio 'OT-TEST-001'...");

    // Simulamos que el frontend eligió a "Sergio" del array de contactos
    const selectedContact = newClient.contacts?.find(
      (c) => c.name === "Sergio",
    );

    const newOrder = await ServiceOrderModel.create({
      code: "OT-TEST-001",
      client: newClient._id,
      contact: {
        // SNAPSHOT: Copiamos los datos
        name: selectedContact?.name,
        email: selectedContact?.email,
        phone: selectedContact?.phone,
        role: selectedContact?.role,
      },
      generalStatus: ServiceOrderState.PENDING,
      observations: "Caja roja entregada en recepción. Urgente.",
    });
    console.log(`✅ Orden creada. ID: ${newOrder._id}`);
    console.log(
      `   👉 Contacto congelado en Orden: ${newOrder.contacts[0]?.name} (${newOrder.contacts[0]?.email})`,
    );

    // --- PASO 3: Ingresar Equipos ---
    console.log("\n🔧 (4/6) Ingresando Equipos a la Orden...");

    const eq1 = await EquipmentModel.create({
      serialNumber: "SN-MAN-001",
      serviceOrder: newOrder._id, // Vinculación Padre
      orderIndex: 0,
      technicalState: "PENDING", // Estado Individual
      logisticState: "RECEIVED",
      tag: "MAN-TGS-01",
      // Campos requeridos por validación estricta
      model: "Manómetro Digital",
      instrumentType: "Manómetro",
      office: dummyCityId, // Asumiendo que es una referencia válida de Oficina/Ubicación
    });
    console.log(
      `   🔹 Equipo 1 creado: ${eq1.serialNumber} (Estado: ${eq1.technicalState})`,
    );

    const eq2 = await EquipmentModel.create({
      serialNumber: "SN-MAN-002",
      serviceOrder: newOrder._id, // Vinculación Padre
      orderIndex: 1,
      technicalState: "PENDING", // SIMULACION: Pendiente de diagnóstico
      logisticState: "RECEIVED",
      tag: "MAN-TGS-02",
      // Campos requeridos por validación estricta
      model: "Manómetro Análogo",
      instrumentType: "Manómetro",
      office: dummyCityId,
    });
    console.log(
      `   🔹 Equipo 2 creado: ${eq2.serialNumber} (Estado: ${eq2.technicalState})`,
    );

    // Actualizamos el array de equipos en la Orden (Opcional pero útil para frontend)
    newOrder.equipments = [
      eq1._id as mongoose.Types.ObjectId,
      eq2._id as mongoose.Types.ObjectId,
    ];
    await newOrder.save();
    console.log("✅ Array de equipos actualizado en la Orden padre.");

    // --- PASO 3.5: VERIFICAR QUE LOS EQUIPOS SE GUARDARON BIEN ---
    console.log("\n🔍 (4/6) Verificando datos de equipos guardados...");
    const verifyEq1 = await EquipmentModel.findById(eq1._id).lean();
    const verifyEq2 = await EquipmentModel.findById(eq2._id).lean();

    console.log("Equipo 1 en DB:", {
      id: verifyEq1?._id,
      serial: verifyEq1?.serialNumber,
      model: verifyEq1?.model,
      state: verifyEq1?.technicalState,
    });
    console.log("Equipo 2 en DB:", {
      id: verifyEq2?._id,
      serial: verifyEq2?.serialNumber,
      model: verifyEq2?.model,
      state: verifyEq2?.technicalState,
    });

    // --- PASO 4: Validación Final ---
    console.log("\n🔍 (5/6) Validando Relaciones...");

    // SOLUCIÓN: En lugar de usar populate (que busca por string ref),
    // vamos a cargar los equipos manualmente usando sus IDs
    const fullOrder = await ServiceOrderModel.findById(newOrder._id).lean();

    if (
      fullOrder &&
      fullOrder.equipments &&
      fullOrder.equipments.length === 2
    ) {
      console.log(
        "🌟 ÉXITO TOTAL: La orden contiene 2 equipos (IDs verificados).",
      );

      // Cargamos los equipos manualmente
      const loadedEquipments = await EquipmentModel.find({
        _id: { $in: fullOrder.equipments },
      }).lean();

      loadedEquipments.forEach((eq, index) => {
        console.log(`   🔹 Detalle Equipo ${index + 1}:`);
        console.log(`       - Serial: ${eq.serialNumber}`);
        console.log(`       - Modelo: ${eq.model}`);
        console.log(`       - Estado Téc: ${eq.technicalState}`);
        console.log(`       - Tag Cliente: ${eq.tag}`);
      });
    } else {
      console.error("❌ ERROR: Algo falló en la vinculación.");
    }

    // Limpieza (Opcional)
    console.log("\n🧹 (6/6) Limpiando datos de prueba...");
    await ClientModel.deleteOne({ _id: newClient._id });
    await ServiceOrderModel.deleteOne({ _id: newOrder._id });
    await EquipmentModel.deleteMany({ serviceOrder: newOrder._id });
    console.log("✅ Limpieza completada.");
  } catch (error) {
    console.error("❌ ERROR CRÍTICO:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Desconectado.");
  }
}

runTestScenario();
