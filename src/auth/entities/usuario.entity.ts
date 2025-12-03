import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Usuario' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id_usuario: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'usuario', type: 'varchar', length: 50, unique: true })
  usuario: string;

  @Column({ name: 'contrasena', type: 'varchar', length: 255 })
  contrasena: string;

  @Column({ name: 'rol', type: 'varchar', length: 50, default: 'empleado' })
  rol: string;

  @Column({ name: 'id_departamento', type: 'int', nullable: true })
  id_departamento: number | null;
}
