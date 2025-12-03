import { IsNotEmpty, IsString, MinLength, IsOptional, IsInt } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @MinLength(6)
  contrasena: string;

  @IsString()
  @IsNotEmpty()
  rol: string; // 'admin' o 'empleado'

  @IsOptional()
  @IsInt()
  id_departamento?: number;
}
