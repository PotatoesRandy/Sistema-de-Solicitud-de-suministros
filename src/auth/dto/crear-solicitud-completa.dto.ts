import { AgregarDetalleDto } from './agregar-detalle.dto';

export class CrearSolicitudCompletaDto {
  descripcion_solicitud: string;
  id_departamento: number;
  id_usuario: number;
  usuario_accion: string;
  detalles: AgregarDetalleDto[];
}