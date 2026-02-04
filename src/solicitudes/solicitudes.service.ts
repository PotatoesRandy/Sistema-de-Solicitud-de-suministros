import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CrearSolicitudDto } from '../auth/dto/crear-solicitud.dto';
import { AgregarDetalleDto } from '../auth/dto/agregar-detalle.dto';
import { CrearSolicitudCompletaDto } from '../auth/dto/crear-solicitud-completa.dto';
import { Solicitud } from './entities/solicitud.entity';

@Injectable()
export class SolicitudesService {
  constructor(
    private configService: ConfigService,
    private connection: Connection,
    @InjectRepository(Solicitud)
    private solicitudRepo: Repository<Solicitud>,
  ) {}

  /**
   * Crear una solicitud nueva usando SQL directo
   */
  async crearSolicitud(dto: CrearSolicitudDto): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Insertar directamente sin stored procedure
      const result = await queryRunner.query(
        `INSERT INTO solicitudes (
          descripcion_solicitud,
          id_departamento,
          id_usuario,
          usuario_accion,
          estado,
          fecha_creacion
        )
        OUTPUT INSERTED.id_solicitud
        VALUES (@0, @1, @2, @3, 'PENDIENTE', GETDATE());`,
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
        id_solicitud: result[0]?.id_solicitud,
        mensaje: 'Solicitud creada exitosamente',
        data: {
          descripcion_solicitud: dto.descripcion_solicitud,
          id_departamento: dto.id_departamento,
          id_usuario: dto.id_usuario,
          estado: 'PENDIENTE'
        }
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
      // Validar que la solicitud existe
      const solicitudExists = await queryRunner.query(
        `SELECT id_solicitud FROM solicitudes WHERE id_solicitud = @0`,
        [id_solicitud]
      );

      if (!solicitudExists || solicitudExists.length === 0) {
        throw new Error('La solicitud no existe');
      }

      // Insertar detalle
      await queryRunner.query(
        `INSERT INTO Solicitud_Detalle (
          id_solicitud,
          id_producto,
          cantidad_solicitada,
          estado_detalle,
          fecha_creacion
        )
        VALUES (@0, @1, @2, 'PENDIENTE', GETDATE());`,
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

  // Método para el controlador
  async crear(dto: CrearSolicitudDto) {
    return this.crearSolicitud(dto);
  }

  // Listar todas las solicitudes
  obtenerTodas() {
    return this.solicitudRepo.find();
  }

  // Listar por estado
  async listarPorEstado(estado: string) {
    return this.solicitudRepo.find({ where: { estado } });
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