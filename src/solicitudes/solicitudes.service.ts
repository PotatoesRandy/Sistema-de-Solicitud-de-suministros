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