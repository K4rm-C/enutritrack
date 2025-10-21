import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilUsuarioService } from './user.service';
import { PerfilUsuarioController } from './user.controller';
import { PerfilUsuario } from './models/user.model';
import { ObjetivoUsuarioService } from '../objetivo-usuario/objetivo-usuario.service';
import { HistorialPesoService } from '../historial-peso/historial-peso.service';
import { ObjetivoUsuario } from '../objetivo-usuario/models/objetivo-usuario.model';
import { HistorialPeso } from '../historial-peso/models/historial-peso.model';
import { CuentasModule } from '../cuentas/cuentas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerfilUsuario, ObjetivoUsuario, HistorialPeso]),
    forwardRef(() => CuentasModule),
  ],
  controllers: [PerfilUsuarioController],
  providers: [PerfilUsuarioService, ObjetivoUsuarioService, HistorialPesoService],
  exports: [PerfilUsuarioService, ObjetivoUsuarioService, HistorialPesoService],
})
export class PerfilUsuarioModule {}
