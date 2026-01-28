const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb://localhost:27017';
const dbName = 'itm';

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    const db = client.db(dbName);

    // 1. Cargar Provincias (States)
    const statesPath = path.join(__dirname, 'itm.states.json');
    const statesData = JSON.parse(fs.readFileSync(statesPath, 'utf8'));

    console.log(`Procesando ${statesData.length} provincias...`);
    for (const state of statesData) {
      const stateId = new ObjectId(state._id.$oid);
      await db.collection('states').updateOne(
        { nombre: state.nombre },
        { 
          $set: { 
            nombre: state.nombre,
            updatedAt: new Date()
          },
          $setOnInsert: { 
            _id: stateId,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
    }
    console.log('Provincias actualizadas.');

    // 2. Cargar Ciudades (Cities)
    const citiesPath = path.join(__dirname, 'itm.cities.json');
    const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

    console.log(`Procesando ${citiesData.length} ciudades...`);
    for (const city of citiesData) {
      const cityId = new ObjectId(city._id.$oid);
      const stateId = new ObjectId(city.state.$oid);

      // Verificamos si existe la ciudad por nombre y estado para evitar duplicados
      await db.collection('cities').updateOne(
        { name: city.name, state: stateId },
        {
          $set: {
            name: city.name,
            state: stateId,
            updatedAt: city.updatedAt && city.updatedAt.$date ? new Date(city.updatedAt.$date) : new Date()
          },
          $setOnInsert: {
            _id: cityId,
            createdAt: city.createdAt && city.createdAt.$date ? new Date(city.createdAt.$date) : new Date()
          }
        },
        { upsert: true }
      );
    }
    console.log('Ciudades actualizadas.');

    const finalStates = await db.collection('states').countDocuments();
    const finalCities = await db.collection('cities').countDocuments();
    console.log(`Resultado final: ${finalStates} provincias, ${finalCities} ciudades.`);

  } catch (error) {
    console.error('Error durante el seed:', error);
  } finally {
    await client.close();
  }
}

seed();
