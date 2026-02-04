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
   * Primero verifica las columnas existentes
   */
  async crearSolicitud(dto: CrearSolicitudDto): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar primero qué columnas tiene la tabla
      const columns = await queryRunner.query(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_NAME = 'solicitudes'`
      );

      console.log('Columnas disponibles en solicitudes:', columns.map(c => c.COLUMN_NAME));

      // Insertar con las columnas mínimas que sabemos que existen
      const result = await queryRunner.query(
        `INSERT INTO solicitudes (
          descripcion_solicitud,
          estado
        )
        OUTPUT INSERTED.id_solicitud, INSERTED.descripcion_solicitud, INSERTED.estado
        VALUES (@0, 'PENDIENTE');`,
        [dto.descripcion_solicitud],
      );

      await queryRunner.commitTransaction();
      
      return {
        success: true,
        id_solicitud: result[0]?.id_solicitud,
        mensaje: 'Solicitud creada exitosamente',
        data: result[0],
        columnas_disponibles: columns.map(c => c.COLUMN_NAME)
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
          estado_detalle
        )
        VALUES (@0, @1, @2, 'PENDIENTE');`,
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