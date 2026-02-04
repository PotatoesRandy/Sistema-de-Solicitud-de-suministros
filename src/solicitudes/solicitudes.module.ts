// src/solicitudes/solicitudes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solicitudes.controller';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudDetalle } from './entities/solicitud-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Solicitud, SolicitudDetalle])],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
  exports: [SolicitudesService],
})
export class SolicitudesModule {}
