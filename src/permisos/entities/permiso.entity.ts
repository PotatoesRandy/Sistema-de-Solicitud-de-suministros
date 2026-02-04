import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn()
  id_permiso: number;

  @Column({ type: 'varchar', unique: true, length: 100 })
  nombre: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  descripcion: string;

  @Column({ type: 'varchar', length: 100 })
  modulo: string;

  @Column({ type: 'bit', default: 1 })
  estado: boolean;

  @ManyToMany('Role', 'permisos')
  roles: any[];
}
