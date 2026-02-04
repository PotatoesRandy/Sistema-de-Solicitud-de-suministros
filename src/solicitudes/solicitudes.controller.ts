import { Controller, Post, Get, Put, Delete, Param, Body, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CrearSolicitudDto } from '../auth/dto/crear-solicitud.dto';
import { AgregarDetalleDto } from '../auth/dto/agregar-detalle.dto';
import { CrearSolicitudCompletaDto } from '../auth/dto/crear-solicitud-completa.dto';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly service: SolicitudesService) {}

  @Post()
  async crear(@Body() dto: CrearSolicitudDto) {
    try {
      return await this.service.crearSolicitud(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async listar() {
    try {
      return await this.service.obtenerTodas();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async buscar(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.obtenerSolicitudCompleta(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post(':id/detalles')
  async agregarDetalle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarDetalleDto,
  ) {
    try {
      return await this.service.agregarDetalle(id, dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('completa')
  async crearCompleta(@Body() dto: CrearSolicitudCompletaDto) {
    try {
      return await this.service.crearSolicitudCompleta(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/estado')
  async aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
  ) {
    try {
      return await this.service.actualizarEstado(id, estado);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.eliminarSolicitud(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
