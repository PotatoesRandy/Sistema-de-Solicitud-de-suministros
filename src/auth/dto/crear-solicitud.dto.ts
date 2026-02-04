import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CrearSolicitudDto {
  @IsString()
  @IsNotEmpty()
  descripcion_solicitud: string;

  @IsInt()
  @IsNotEmpty()
  id_departamento: number;

  @IsInt()
  @IsNotEmpty()
  id_usuario: number;

  @IsString()
  @IsNotEmpty()
  usuario_accion: string;
}
