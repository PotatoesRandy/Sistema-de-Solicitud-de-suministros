import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SolicitudDetalle } from './solicitud-detalle.entity';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn({ name: 'id_solicitud' })
  id_solicitud: number;

  @Column({ nullable: true })
  nombre_solicitud: string;

  @Column({ nullable: true })
  cantidad: number;

  @Column({ nullable: true })
  departamento_solicitud: string;

  @Column({ nullable: true })
  id_usuario: number;

  @Column({ default: 'PENDIENTE', nullable: true })
  estado: string;

  @Column({ nullable: true })
  usuario_accion: string;

  @Column({ type: 'datetime', nullable: true })
  fecha_creacion: Date;

  @OneToMany(() => SolicitudDetalle, detalle => detalle.solicitud)
  detalles: SolicitudDetalle[];
}
