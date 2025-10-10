import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { Cuenta } from './models/cuenta.model';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { LoginCuentaDto } from './dto/login-cuenta.dto';

@Injectable()
export class CuentasService {
  constructor(
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
  ) {}

  async create(createCuentaDto: CreateCuentaDto): Promise<Cuenta> {
    const { email, tipo_cuenta, activa = true } = createCuentaDto;

    const existingCuenta = await this.cuentaRepository.findOne({
      where: { email },
    });
    if (existingCuenta) {
      throw new ConflictException('El email ya está registrado');
    }

    const contraseña_hash = await hash('password123', 10);

    const cuenta = this.cuentaRepository.create({
      email,
      contraseña_hash,
      tipo_cuenta,
      activa,
    });

    return await this.cuentaRepository.save(cuenta);
  }

  async findAll(): Promise<Cuenta[]> {
    return await this.cuentaRepository.find();
  }

  async findOne(id: string): Promise<Cuenta> {
    const cuenta = await this.cuentaRepository.findOne({ where: { id } });
    if (!cuenta) {
      throw new NotFoundException('Cuenta no encontrada');
    }
    return cuenta;
  }

  async findByEmail(email: string): Promise<Cuenta> {
    const cuenta = await this.cuentaRepository.findOne({ where: { email } });
    if (!cuenta) {
      throw new NotFoundException('Cuenta no encontrada');
    }
    return cuenta;
  }

  async update(id: string, updateCuentaDto: UpdateCuentaDto): Promise<Cuenta> {
    const cuenta = await this.findOne(id);
    Object.assign(cuenta, updateCuentaDto);
    return await this.cuentaRepository.save(cuenta);
  }

  async remove(id: string): Promise<void> {
    const cuenta = await this.findOne(id);
    await this.cuentaRepository.remove(cuenta);
  }

  async validateUser(loginCuentaDto: LoginCuentaDto): Promise<Cuenta> {
    const { email, password } = loginCuentaDto;
    const cuenta = await this.findByEmail(email);

    const isValidPassword = await compare(password, cuenta.contraseña_hash);
    if (!isValidPassword) {
      throw new NotFoundException('Credenciales inválidas');
    }

    if (!cuenta.activa) {
      throw new NotFoundException('Cuenta inactiva');
    }

    // Actualizar último acceso
    cuenta.ultimo_acceso = new Date();
    await this.cuentaRepository.save(cuenta);

    return cuenta;
  }
}
