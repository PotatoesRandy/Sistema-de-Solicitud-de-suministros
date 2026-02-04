import { Controller, Post, Get, Body, Param, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CrearSolicitudDto } from '../auth/dto/crear-solicitud.dto';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly service: SolicitudesService) {}

  @Post()
  crear(@Body() dto: CrearSolicitudDto) {
    return this.service.crear(dto);
  }

  @Get()
  async listar() {
    try {
      return await this.service.obtenerTodas();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('estado/:estado')
  listarPorEstado(@Param('estado') estado: string) {
    return this.service.listarPorEstado(estado);
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
