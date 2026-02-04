import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SolicitudDetalle } from './solicitud-detalle.entity';

@Entity('Solicitud')
export class Solicitud {
  @PrimaryGeneratedColumn({ name: 'id_solicitud' })
  id: number;

  @Column()
  id_departamento: number;

  @Column()
  descripcion_solicitud: string;

  @Column({ default: 'Pendiente' })
  estado: string;

  @Column({ name: 'departamento_solicitud', type: 'varchar', length: 100, nullable: true })
  departamento_solicitud: string;

  @OneToMany(() => SolicitudDetalle, detalle => detalle.solicitud)
  detalles: SolicitudDetalle[];
}
