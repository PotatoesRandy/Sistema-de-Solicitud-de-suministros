import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('solicitudes') // ← Cambio aquí: era 'solicitudes'
export class Solicitud {
  @PrimaryGeneratedColumn({ name: 'id_solicitud' }) // ← Mapeo al nombre real
  id: number;

  @Column({ name: 'nombre_solicitud', type: 'varchar', length: 150 })
  nombre_solicitud: string;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad: number;

  @Column({ name: 'departamento_solicitud', type: 'varchar', length: 100, nullable: true })
  departamento_solicitud: string;
}