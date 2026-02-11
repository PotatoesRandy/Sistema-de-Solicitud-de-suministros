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
    // Extraer datos del usuario del token JWT y convertir a número
    const id_usuario = parseInt(req.user.sub);
    const usuario_accion = req.user.username;
    
    console.log('ID Usuario:', id_usuario, 'Tipo:', typeof id_usuario);
    console.log('Usuario Accion:', usuario_accion);
    
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
  async aprobar(@Param('id') id: number, @Body() body: { codigo: string }) {
    try {
      return await this.service.aprobar(id, body.codigo);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/rechazar')
  async rechazar(@Param('id') id: number, @Body() body: { codigo: string }) {
    try {
      return await this.service.rechazar(id, body.codigo);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
