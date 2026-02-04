import { Module } from '@nestjs/common';
import { PermisosService } from './permisos/permisos.service';
import { PermisosController } from './permisos/permisos.controller';

@Module({
  providers: [PermisosService],
  controllers: [PermisosController]
})
export class PermisosModule {}
