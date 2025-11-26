import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesModule } from './solicitudes/solicitudes.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'Randy-PC',
      port: 1433,
      username: 'user_app',
      password: 'Password123!',
      database: 'sistema_suministros',
      
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },

      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),

    SolicitudesModule,
  ],
})
export class AppModule {}