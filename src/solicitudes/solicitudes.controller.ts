import { Controller, Post, Get, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private service: SolicitudesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Body() dto: CreateSolicitudDto, @GetUser() user: any) {
    return this.service.crear({ ...dto, id_usuario: user.id });
  }

  @Get()
  listar() {
    return this.service.listar();
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

  @Patch(':id/rechazar')
  rechazar(@Param('id') id: number) {
    return this.service.rechazar(id);
  }
}
