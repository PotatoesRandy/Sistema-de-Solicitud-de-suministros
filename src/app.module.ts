import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Usuario } from './auth/entities/usuario.entity';
// importa otras entidades si es necesario (Solicitud, Producto, etc.)

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 1433),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Usuario /*, ...otras entidades*/],
      synchronize: false, // en dev true, en prod false
      options: { encrypt: false }, // o true si tienes TLS
    }),
    AuthModule,
    // Otros módulos...
  ],
})
export class AppModule {}
