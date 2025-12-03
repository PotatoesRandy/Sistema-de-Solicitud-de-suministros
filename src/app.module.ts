import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module'; // ← AGREGAR
import { Usuario } from './auth/entities/usuario.entity';
import { Solicitud } from './solicitudes/entities/solicitud.entity'; // ← AGREGAR

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
      entities: [Usuario, Solicitud], // ← AGREGAR Solicitud
      synchronize: false,
      options: { encrypt: false },
    }),
    AuthModule,
    SolicitudesModule, // ← AGREGAR
  ],
})
export class AppModule {}