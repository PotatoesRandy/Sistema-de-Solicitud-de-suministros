import { IsString, IsInt, IsOptional, Length } from 'class-validator';

export class CreateSolicitudDto {
  @IsString()
  @Length(1, 150)
  nombre_solicitud: string;

  @IsInt()
  cantidad: number;

  @IsString()
  @IsOptional()
  departamento_solicitud?: string;
}
