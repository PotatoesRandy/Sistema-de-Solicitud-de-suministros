import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';

import { Usuario } from './auth/entities/usuario.entity';
import { Solicitud } from './solicitudes/entities/solicitud.entity';
import { SolicitudDetalle } from './solicitudes/entities/solicitud-detalle.entity';
import { Role } from './roles/entities/role.entity';
import { Permiso } from './permisos/entities/permiso.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'Randy-PC',
      port: 1433,
      username: 'sistema_app',
      password: 'Sistema@2026',
      database: 'sistema_suministros',
      entities: [Usuario, Solicitud, SolicitudDetalle, Role, Permiso],
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    AuthModule,
    SolicitudesModule,
    RolesModule,
    PermisosModule,
  ],
})
export class AppModule {}
