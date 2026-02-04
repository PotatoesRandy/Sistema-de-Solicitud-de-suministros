import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SolicitudDetalle } from './solicitud-detalle.entity';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn({ name: 'id_solicitud' })
  id: number;

  @Column({ nullable: true })
  id_departamento: number;

  @Column()
  descripcion_solicitud: string;

  @Column({ nullable: true })
  id_usuario: number;

  @Column({ nullable: true })
  usuario_accion: string;

  @Column({ default: 'PENDIENTE' })
  estado: string;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fecha_creacion: Date;

  @Column({ type: 'datetime', nullable: true })
  fecha_aprobacion: Date;

  @OneToMany(() => SolicitudDetalle, detalle => detalle.solicitud)
  detalles: SolicitudDetalle[];
}
