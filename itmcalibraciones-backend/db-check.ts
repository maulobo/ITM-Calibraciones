import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function verifyDbConnection() {
  console.log('🚀 Checking Database Connection...');
  try {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
    console.log('✅ Connection Sucessful!');
    
    // We can also try to access a model to be sure
    const mongoose = app.get('MongooseConnection'); // or verify via MongooseModule
    // But AppModule initialization implies connection success mostly if configured properly.

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Connection Failed!');
    console.error('Error Details:', error.message);
    process.exit(1);
  }
}

verifyDbConnection();
