// Script para crear datos de prueba en MongoDB
const { MongoClient, ObjectId } = require("mongodb");

async function seedData() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    const db = client.db("itm");

    // Crear ciudad
    const cityResult = await db.collection("cities").insertOne({
      name: "Buenos Aires",
      province: "Buenos Aires",
      country: "Argentina",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const cityId = cityResult.insertedId;
    console.log("✅ Ciudad creada:", cityId.toString());

    // Crear cliente
    const clientResult = await db.collection("clients").insertOne({
      name: "TGS (Transportadora de Gas del Sur)",
      cuit: "30-12345678-9",
      address: "Av. Corrientes 123",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const clientId = clientResult.insertedId;
    console.log("✅ Cliente creado:", clientId.toString());

    // Crear oficina Norte
    const officeNorteResult = await db.collection("offices").insertOne({
      name: "TGS Oficina Norte",
      client: clientId,
      city: cityId,
      address: "Zona Norte",
      phone: "011-1111-1111",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(
      "✅ Oficina Norte creada:",
      officeNorteResult.insertedId.toString(),
    );

    // Crear oficina Sur
    const officeSurResult = await db.collection("offices").insertOne({
      name: "TGS Oficina Sur",
      client: clientId,
      city: cityId,
      address: "Zona Sur",
      phone: "011-2222-2222",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(
      "✅ Oficina Sur creada:",
      officeSurResult.insertedId.toString(),
    );

    console.log("\n📋 Resumen:");
    console.log("Ciudad ID:", cityId.toString());
    console.log("Cliente ID:", clientId.toString());
    console.log("Oficina Norte ID:", officeNorteResult.insertedId.toString());
    console.log("Oficina Sur ID:", officeSurResult.insertedId.toString());
  } finally {
    await client.close();
  }
}

seedData().catch(console.error);
