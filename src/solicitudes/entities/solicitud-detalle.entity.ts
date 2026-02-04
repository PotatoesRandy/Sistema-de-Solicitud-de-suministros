import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Solicitud } from './solicitud.entity';

@Entity('SolicitudDetalle')
export class SolicitudDetalle {
  @PrimaryGeneratedColumn()
  id_detalle: number;

  @Column()
  id_solicitud: number;

  @Column()
  id_producto: number;

  @Column()
  cantidad_solicitada: number;

  @Column({ default: 'Pendiente' })
  estado_detalle: string;

  @ManyToOne(() => Solicitud, solicitud => solicitud.detalles)
  @JoinColumn({ name: 'id_solicitud' })
  solicitud: Solicitud;
}
