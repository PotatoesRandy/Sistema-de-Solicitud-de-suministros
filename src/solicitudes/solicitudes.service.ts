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

  /**
   * Crear solicitud con múltiples elementos en una sola operación
   */
  async crearSolicitudCompleta(dto: CrearSolicitudCompletaDto): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear la solicitud
      const solicitudResult = await queryRunner.query(
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

      const id_solicitud = solicitudResult[0].id_solicitud;

      // 2. Agregar todos los detalles
      for (const detalle of dto.detalles) {
        await queryRunner.query(
          `EXEC sp_agregar_detalle_solicitud
             @p_id_solicitud = @sol,
             @p_id_producto = @prod,
             @p_cantidad = @cant`,
          [id_solicitud, detalle.id_producto, detalle.cantidad_solicitada],
        );
      }

      await queryRunner.commitTransaction();
      return {
        success: true,
        id_solicitud,
        detalles_agregados: dto.detalles.length,
        mensaje: 'Solicitud creada con todos los elementos',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Error al crear solicitud completa: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtener solicitud con todos sus detalles
   */
  async obtenerSolicitudCompleta(id_solicitud: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      const resultados = await queryRunner.query(
        `EXEC sp_obtener_solicitud_completa @p_id_solicitud = @sol`,
        [id_solicitud],
      );

      if (!resultados || resultados.length === 0) {
        throw new Error('Solicitud no encontrada');
      }

      // resultados[0] = datos principales
      // resultados[1] = detalles de productos
      return {
        solicitud: resultados[0][0],
        detalles: resultados[1],
      };
    } catch (error) {
      throw new Error(`Error al obtener solicitud: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtener todas las solicitudes
   */
  async obtenerTodas(): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      return await queryRunner.query(`
        SELECT
          s.id_solicitud,
          s.descripcion_solicitud,
          s.estado,
          s.fecha_creacion,
          d.nombre_departamento,
          u.nombre as usuario_nombre,
          COUNT(sd.id_detalle) as cantidad_items
        FROM solicitudes s
        LEFT JOIN Departamento d ON s.id_departamento = d.id_departamento
        LEFT JOIN Usuario u ON s.id_usuario = u.id_usuario
        LEFT JOIN Solicitud_Detalle sd ON s.id_solicitud = sd.id_solicitud
        GROUP BY s.id_solicitud, s.descripcion_solicitud, s.estado, 
                 s.fecha_creacion, d.nombre_departamento, u.nombre
        ORDER BY s.fecha_creacion DESC
      `);
    } catch (error) {
      throw new Error(`Error al obtener solicitudes: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Actualizar estado de una solicitud
   */
  async actualizarEstado(
    id_solicitud: number,
    nuevo_estado: string,
  ): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `UPDATE solicitudes 
         SET estado = @estado, fecha_aprobacion = GETDATE()
         WHERE id_solicitud = @sol`,
        [nuevo_estado, id_solicitud],
      );

      await queryRunner.commitTransaction();
      return {
        success: true,
        mensaje: `Solicitud actualizada a estado: ${nuevo_estado}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al actualizar solicitud: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Eliminar una solicitud (elimina también sus detalles por cascada)
   */
  async eliminarSolicitud(id_solicitud: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const resultado = await queryRunner.query(
        `DELETE FROM solicitudes WHERE id_solicitud = @sol`,
        [id_solicitud],
      );

      await queryRunner.commitTransaction();
      return {
        success: true,
        mensaje: 'Solicitud eliminada correctamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al eliminar solicitud: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
