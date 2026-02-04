import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Rol')
export class Role {
  @PrimaryGeneratedColumn()
  id_rol: number;

  @Column({ length: 50, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;
}
