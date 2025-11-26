import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuarioId: number;

  @Column()
  articulo: string;

  @Column()
  cantidad: number;

  @Column()
  motivo: string;

  @Column({ default: 'pendiente' })
  estado: string;
}
