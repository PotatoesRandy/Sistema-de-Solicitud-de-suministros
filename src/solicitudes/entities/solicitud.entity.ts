import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SolicitudDetalle } from './solicitud-detalle.entity';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn({ name: 'id_solicitud' })
  id: number;

  @Column({ nullable: true })
  descripcion_solicitud: string;

  @Column({ default: 'PENDIENTE', nullable: true })
  estado: string;

  @OneToMany(() => SolicitudDetalle, detalle => detalle.solicitud)
  detalles: SolicitudDetalle[];
}
