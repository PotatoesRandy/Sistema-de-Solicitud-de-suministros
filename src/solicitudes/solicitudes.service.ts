import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly repo: Repository<Solicitud>,
  ) {}

  // Crear una solicitud y asignar automaticamente el usuario del token
  async crear(dto: CreateSolicitudDto, user: any) {
    const solicitud = this.repo.create({
      ...dto,
      id_usuario: user.sub, // 👈 EL ID DEL USUARIO QUE ESTÁ EN EL TOKEN
    });

    return await this.repo.save(solicitud);
  }

  // Listar todas las solicitudes
  async listar() {
    return await this.repo.find();
  }

  // Buscar una solicitud por ID
  async buscar(id: number) {
    const solicitud = await this.repo.findOne({ where: { id } });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return solicitud;
  }

  // Aprobar una solicitud (actualizas lo que necesites)
  async aprobar(id: number) {
    const solicitud = await this.repo.findOne({ where: { id } });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Aquí puedes actualizar un campo "estado" si tu tabla lo tiene
    // solicitud.estado = "Aprobada";

    return await this.repo.save(solicitud);
  }
}
