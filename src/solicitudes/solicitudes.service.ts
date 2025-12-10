import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudRepo: Repository<Solicitud>,
  ) {}

  // Crear
  crear(dto: any) {
    const nueva = this.solicitudRepo.create(dto);
    return this.solicitudRepo.save(nueva);
  }

  // Listar con datos del usuario
  async listar() {
    const solicitudes = await this.solicitudRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('Usuario', 'u', 's.id_usuario = u.id_usuario')
      .select([
        's.id_solicitud AS id',
        's.nombre_solicitud AS nombre_solicitud',
        's.cantidad AS cantidad',
        's.departamento_solicitud AS departamento_solicitud',
        's.id_usuario AS id_usuario',
        's.estado AS estado',
        'u.nombre AS nombre_usuario',
        'u.usuario AS username',
        'u.rol AS rol_usuario'
      ])
      .orderBy('s.id_solicitud', 'DESC')
      .getRawMany();

    return solicitudes;
  }

  // Buscar por ID con datos del usuario
  async buscar(id: number) {
    const solicitud = await this.solicitudRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('Usuario', 'u', 's.id_usuario = u.id_usuario')
      .where('s.id_solicitud = :id', { id })
      .select([
        's.id_solicitud AS id',
        's.nombre_solicitud AS nombre_solicitud',
        's.cantidad AS cantidad',
        's.departamento_solicitud AS departamento_solicitud',
        's.id_usuario AS id_usuario',
        's.estado AS estado',
        'u.nombre AS nombre_usuario',
        'u.usuario AS username',
        'u.rol AS rol_usuario'
      ])
      .getRawOne();

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return solicitud;
  }

  // Aprobar solicitud
  async aprobar(id: number) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id } });
    
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Cambiar estado a APROBADO
    solicitud.estado = 'APROBADO';
    await this.solicitudRepo.save(solicitud);

    // Retornar con datos del usuario
    return this.buscar(id);
  }

  // Rechazar solicitud
  async rechazar(id: number) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id } });
    
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Cambiar estado a RECHAZADO
    solicitud.estado = 'RECHAZADO';
    await this.solicitudRepo.save(solicitud);

    // Retornar con datos del usuario
    return this.buscar(id);
  }

  // Listar por estado
  async listarPorEstado(estado: string) {
    return await this.solicitudRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('Usuario', 'u', 's.id_usuario = u.id_usuario')
      .where('s.estado = :estado', { estado: estado.toUpperCase() })
      .select([
        's.id_solicitud AS id',
        's.nombre_solicitud AS nombre_solicitud',
        's.cantidad AS cantidad',
        's.departamento_solicitud AS departamento_solicitud',
        's.id_usuario AS id_usuario',
        's.estado AS estado',
        'u.nombre AS nombre_usuario',
        'u.usuario AS username',
        'u.rol AS rol_usuario'
      ])
      .orderBy('s.id_solicitud', 'DESC')
      .getRawMany();
  }
}