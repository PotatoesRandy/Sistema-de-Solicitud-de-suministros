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
   * Generar código de autorización único
   */
  private generarCodigoAutorizacion(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${timestamp}-${random}`;
  }

  /**
   * Crear una solicitud nueva usando TypeORM Repository
   */
  async crearSolicitud(dto: CreateSolicitudDto, id_usuario: number, usuario_accion: string): Promise<any> {
    try {
      console.log('En service - ID Usuario:', id_usuario, 'Tipo:', typeof id_usuario);
      console.log('En service - Usuario Accion:', usuario_accion);
      
      // Crear solicitud usando el repositorio de TypeORM
      const nuevaSolicitud = this.solicitudRepo.create({
        nombre_solicitud: dto.nombre_solicitud,
        cantidad: dto.cantidad,
        departamento_solicitud: dto.departamento_solicitud,
        id_usuario: id_usuario,
        usuario_accion: usuario_accion,
        estado: 'PENDIENTE',
        fecha_creacion: new Date(),
        codigo_autorizacion: this.generarCodigoAutorizacion(),
      });

      console.log('Solicitud antes de guardar:', nuevaSolicitud);
      const solicitudGuardada = await this.solicitudRepo.save(nuevaSolicitud);
      console.log('Solicitud después de guardar:', solicitudGuardada);

      return {
        success: true,
        id_solicitud: solicitudGuardada.id_solicitud,
        codigo_autorizacion: solicitudGuardada.codigo_autorizacion,
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
  async crear(dto: CreateSolicitudDto, id_usuario: number, usuario_accion: string) {
    return this.crearSolicitud(dto, id_usuario, usuario_accion);
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
    const solicitud = await this.solicitudRepo.findOne({ where: { id_solicitud: id } });
    if (!solicitud) return [] 
    // if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    return solicitud;
  }

  // Aprobar con código de autorización
  async aprobar(id: number, codigo: string) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id_solicitud: id } });
    
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    if (solicitud.codigo_autorizacion !== codigo) {
      throw new Error('Código de autorización inválido');
    }

    solicitud.estado = 'APROBADA';
    await this.solicitudRepo.save(solicitud);

    return {
      success: true,
      mensaje: 'Solicitud aprobada exitosamente',
      data: solicitud
    };
  }

  // Rechazar con código
  async rechazar(id: number, codigo: string) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id_solicitud: id } });
    
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    if (solicitud.codigo_autorizacion !== codigo) {
      throw new Error('Código de autorización inválido');
    }

    solicitud.estado = 'RECHAZADA';
    await this.solicitudRepo.save(solicitud);

    return {
      success: true,
      mensaje: 'Solicitud rechazada',
      data: solicitud
    };
  }
}
