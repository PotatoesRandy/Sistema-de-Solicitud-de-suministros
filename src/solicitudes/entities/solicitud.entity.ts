import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn({ name: 'id_solicitud' })
  id: number;

  @Column({ name: 'nombre_solicitud', type: 'varchar', length: 150 })
  nombre_solicitud: string;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad: number;

  @Column({ name: 'departamento_solicitud', type: 'varchar', length: 100, nullable: true })
  departamento_solicitud: string;

  @Column({ name: 'id_usuario', type: 'int' })
  id_usuario: number; // 👈 IMPORTANTÍSIMO
}
