import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private service: SolicitudesService) {}

  @Post()
  crear(@Body() dto: CreateSolicitudDto) {
    return this.service.crear(dto);
  }

  @Get()
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  buscar(@Param('id') id: number) {
    return this.service.buscar(id);
  }

  @Patch(':id/aprobar')
  aprobar(@Param('id') id: number) {
    return this.service.aprobar(id);
  }

  
}
