import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log('📝 Endpoints disponibles:');
  console.log('   POST http://localhost:3000/auth/register');
  console.log('   POST http://localhost:3000/auth/login');
  console.log('   GET  http://localhost:3000/auth/profile   (🔐 Requiere Token)');
  console.log('   POST http://localhost:3000/solicitudes');
  console.log('   GET  http://localhost:3000/solicitudes');
  console.log('   GET  http://localhost:3000/solicitudes/:id');
  console.log('   PATCH http://localhost:3000/solicitudes/:id/aprobar');
}
bootstrap();
