import { Controller, Post, Get, Body, Param, Patch, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly service: SolicitudesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  crear(@Body() dto: CreateSolicitudDto, @Req() req) {
    // Extraer datos del usuario del token JWT
    const id_usuario = req.user.sub;
    const usuario_accion = req.user.username;
    
    return this.service.crear(dto, id_usuario, usuario_accion);
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
