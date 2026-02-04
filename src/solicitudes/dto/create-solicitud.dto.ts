import { IsString, IsInt, IsOptional, Length, IsNotEmpty } from 'class-validator';

export class CreateSolicitudDto {
  @IsString()
  @Length(1, 150)
  nombre_solicitud: string;

  @IsInt()
  cantidad: number;

  @IsString()
  @IsOptional()
  departamento_solicitud?: string;

  @IsInt()
  @IsNotEmpty()
  id_usuario: number;

  @IsString()
  @IsNotEmpty()
  usuario_accion: string;
}
