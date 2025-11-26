import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';

@Injectable()
export class SolicitudesService {
  @InjectRepository(Solicitud)
private readonly solicitudRepo: Repository<Solicitud>


  // Crear
  crear(dto: any) {
    const nueva = this.solicitudRepo.create(dto);
    return this.solicitudRepo.save(nueva);
  }

  // Listar
  listar() {
    return this.solicitudRepo.find();
  }

  // Buscar
  async buscar(id: number) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id } });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    return solicitud;
  }

  // Aprobar
  async aprobar(id: number) {
    const solicitud = await this.buscar(id);

    solicitud.estado = 'APROBADA';  // ← Asegúrate de tener este campo en tu entidad

    return this.solicitudRepo.save(solicitud);
  }
}
