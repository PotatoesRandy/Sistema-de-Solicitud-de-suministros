import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usuarioRepo.findOne({ where: { usuario: dto.usuario } });
    if (exists) throw new ConflictException('El usuario ya existe');

    const hashed = await bcrypt.hash(dto.contrasena, 10);

    const user = this.usuarioRepo.create({
      nombre: dto.nombre,
      usuario: dto.usuario,
      contrasena: hashed,
      rol: dto.rol,
      id_departamento: dto.id_departamento ?? null,
    });

    const saved = await this.usuarioRepo.save(user);
    const { contrasena, ...safe } = saved as any;
    return safe;
  }

  async login(dto: LoginDto) {
    const user = await this.usuarioRepo.findOne({ where: { usuario: dto.usuario } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const match = await bcrypt.compare(dto.contrasena, user.contrasena);
    if (!match) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { username: user.usuario, sub: user.id_usuario, rol: user.rol };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: { id_usuario: user.id_usuario, nombre: user.nombre, usuario: user.usuario, rol: user.rol },
    };
  }
}
