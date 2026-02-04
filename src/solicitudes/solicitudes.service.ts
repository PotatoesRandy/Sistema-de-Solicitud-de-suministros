import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { AgregarDetalleDto } from '../auth/dto/agregar-detalle.dto';
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
   * Crear una solicitud nueva usando TypeORM Repository
   */
  async crearSolicitud(dto: CreateSolicitudDto): Promise<any> {
    try {
      // Crear solicitud usando el repositorio de TypeORM
      const nuevaSolicitud = this.solicitudRepo.create({
        nombre_solicitud: dto.nombre_solicitud,
        cantidad: dto.cantidad,
        departamento_solicitud: dto.departamento_solicitud,
        estado: 'PENDIENTE',
      });

      const solicitudGuardada = await this.solicitudRepo.save(nuevaSolicitud);

      return {
        success: true,
        id_solicitud: solicitudGuardada.id,
        mensaje: 'Solicitud creada exitosamente',
        data: solicitudGuardada
      };
    } catch (error) {
      console.error('Error completo:', error);
      throw new Error(`Error al crear solicitud: ${error.message}`);
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
  async crear(dto: CreateSolicitudDto) {
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