const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const uri = 'mongodb://localhost:27017';
const dbName = 'itm';

const inputData = {
  "Argentina": {
    "Buenos Aires": [
      "La Plata", "Mar del Plata", "Bahía Blanca", "Tandil", "Olavarría", "Junín", "Pergamino", "Luján", "San Nicolás", "Zárate", "Campana", "Avellaneda", "Lanús", "Quilmes", "Morón", "San Isidro", "Tigre"
    ],
    "Ciudad Autónoma de Buenos Aires": [
      "Buenos Aires"
    ],
    "Catamarca": [
      "San Fernando del Valle de Catamarca", "Andalgalá", "Belén", "Santa María"
    ],
    "Chaco": [
      "Resistencia", "Presidencia Roque Sáenz Peña", "Villa Ángela", "Charata", "Barranqueras"
    ],
    "Chubut": [
      "Rawson", "Trelew", "Comodoro Rivadavia", "Puerto Madryn", "Esquel"
    ],
    "Córdoba": [
      "Córdoba", "Villa Carlos Paz", "Río Cuarto", "San Francisco", "Villa María", "Alta Gracia"
    ],
    "Corrientes": [
      "Corrientes", "Goya", "Paso de los Libres", "Mercedes", "Curuzú Cuatiá"
    ],
    "Entre Ríos": [
      "Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay", "Gualeguay"
    ],
    "Formosa": [
      "Formosa", "Clorinda", "Pirané", "El Colorado"
    ],
    "Jujuy": [
      "San Salvador de Jujuy", "Palpalá", "Perico", "Libertador General San Martín", "La Quiaca"
    ],
    "La Pampa": [
      "Santa Rosa", "General Pico", "Toay", "Realicó"
    ],
    "La Rioja": [
      "La Rioja", "Chilecito", "Aimogasta", "Chamical"
    ],
    "Mendoza": [
      "Mendoza", "San Rafael", "Godoy Cruz", "Las Heras", "Luján de Cuyo", "Maipú"
    ],
    "Misiones": [
      "Posadas", "Oberá", "Eldorado", "Puerto Iguazú", "Apóstoles"
    ],
    "Neuquén": [
      "Neuquén", "Cutral Có", "Plottier", "Zapala", "San Martín de los Andes"
    ],
    "Río Negro": [
      "Viedma", "San Carlos de Bariloche", "General Roca", "Cipolletti", "El Bolsón"
    ],
    "Salta": [
      "Salta", "San Ramón de la Nueva Orán", "Tartagal", "Cafayate", "General Güemes"
    ],
    "San Juan": [
      "San Juan", "Rawson", "Rivadavia", "Chimbas", "Pocito"
    ],
    "San Luis": [
      "San Luis", "Villa Mercedes", "Merlo", "Justo Daract"
    ],
    "Santa Cruz": [
      "Río Gallegos", "Caleta Olivia", "El Calafate", "Puerto Deseado"
    ],
    "Santa Fe": [
      "Santa Fe", "Rosario", "Rafaela", "Venado Tuerto", "Reconquista", "Santo Tomé"
    ],
    "Santiago del Estero": [
      "Santiago del Estero", "La Banda", "Termas de Río Hondo", "Añatuya"
    ],
    "Tierra del Fuego": [
      "Ushuaia", "Río Grande", "Tolhuin"
    ],
    "Tucumán": [
      "San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo", "Concepción", "Aguilares"
    ]
  }
};

// Mapeo manual de nombres del JSON a los nombres que espera la DB (para normalizar)
const stateNameMapping = {
    "Ciudad Autónoma de Buenos Aires": "Ciudad Autónoma de Buenos Aires (CABA)"
};

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado a MongoDB para actualización masiva de locaciones.');
    const db = client.db(dbName);

    const provinces = inputData.Argentina;

    for (const [provinceName, cities] of Object.entries(provinces)) {
      const dbStateName = stateNameMapping[provinceName] || provinceName;
      
      // 1. Asegurar que la provincia existe
      let state = await db.collection('states').findOne({ nombre: dbStateName });
      
      if (!state) {
        console.log(`Creando provincia: ${dbStateName}`);
        const result = await db.collection('states').insertOne({
          nombre: dbStateName,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        state = { _id: result.insertedId, nombre: dbStateName };
      }

      // 2. Procesar ciudades para esta provincia
      console.log(`Procesando ${cities.length} ciudades para ${dbStateName}...`);
      for (const cityName of cities) {
        await db.collection('cities').updateOne(
          { name: cityName, state: state._id },
          {
            $set: {
              name: cityName,
              state: state._id,
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          { upsert: true }
        );
      }
    }

    const finalStates = await db.collection('states').countDocuments();
    const finalCities = await db.collection('cities').countDocuments();
    console.log(`Seed completado. Total en DB: ${finalStates} provincias, ${finalCities} ciudades.`);

  } catch (error) {
    console.error('Error durante el seed:', error);
  } finally {
    await client.close();
  }
}

seed();
