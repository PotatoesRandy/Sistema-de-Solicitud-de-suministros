import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SolicitudDetalle } from './solicitud-detalle.entity';

@Entity('Solicitud')
export class Solicitud {
  @PrimaryGeneratedColumn()
  id_solicitud: number;

  @Column()
  id_usuario: number;

  @Column()
  id_departamento: number;

  @Column()
  descripcion_solicitud: string;

  @Column({ default: 'Pendiente' })
  estado: string;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fecha_creacion: Date;

  @OneToMany(() => SolicitudDetalle, detalle => detalle.solicitud)
  detalles: SolicitudDetalle[];
}
