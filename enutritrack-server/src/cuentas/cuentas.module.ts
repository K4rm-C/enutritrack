import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentasService } from './cuentas.service';
import { CuentasController } from './cuentas.controller';
import { Cuenta } from './models/cuenta.model';

@Module({
  imports: [TypeOrmModule.forFeature([Cuenta])],
  controllers: [CuentasController],
  providers: [CuentasService],
  exports: [CuentasService],
})
export class CuentasModule {}
