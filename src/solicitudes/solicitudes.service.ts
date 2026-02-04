import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { CrearSolicitudDto } from '../auth/dto/crear-solicitud.dto';
import { AgregarDetalleDto } from '../auth/dto/agregar-detalle.dto';
import { CrearSolicitudCompletaDto } from '../auth/dto/crear-solicitud-completa.dto';
@Injectable()
export class SolicitudesService {
  constructor(
    private configService: ConfigService,
    private connection: Connection,
  ) {}

  // resto del código...




  /**
   * Crear una solicitud nueva
   */
  async crearSolicitud(dto: CrearSolicitudDto): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.query(
        `DECLARE @id_solicitud INT;
         EXEC sp_crear_solicitud 
           @p_descripcion = @desc,
           @p_id_departamento = @dept,
           @p_id_usuario = @usuario,
           @p_usuario_accion = @accion,
           @p_id_solicitud = @id_solicitud OUTPUT;
         SELECT @id_solicitud as id_solicitud;`,
        [
          dto.descripcion_solicitud,
          dto.id_departamento,
          dto.id_usuario,
          dto.usuario_accion,
        ],
      );

      await queryRunner.commitTransaction();
      return {
        success: true,
        id_solicitud: result[0].id_solicitud,
        mensaje: 'Solicitud creada exitosamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al crear solicitud: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Agregar un producto a una solicitud existente
   */
  async agregarDetalle(
    id_solicitud: number,
    dto: AgregarDetalleDto,
  ): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `EXEC sp_agregar_detalle_solicitud
           @p_id_solicitud = @sol,
           @p_id_producto = @prod,
           @p_cantidad = @cant`,
        [id_solicitud, dto.id_producto, dto.cantidad_solicitada],
      );

      await queryRunner.commitTransaction();
      return {
        success: true,
        mensaje: 'Producto agregado a la solicitud',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Error al agregar detalle: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Listar
  listar() {
    return this.solicitudRepo.find();
  }

  // Buscar
  async buscar(id: number) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id } });
    if (!solicitud) return []    
   // if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    return solicitud;
  }

  // Aprobar (sin modificar estado porque no existe en la BD)
  async aprobar(id: number) {
    const solicitud = await this.buscar(id);
    // Por ahora solo retorna la solicitud
    // Más adelante puedes agregar lógica de aprobación
    return solicitud;
  }
}