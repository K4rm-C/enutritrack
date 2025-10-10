import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjetivoUsuarioService } from './objetivo-usuario.service';
import { ObjetivoUsuarioController } from './objetivo-usuario.controller';
import { ObjetivoUsuario } from './models/objetivo-usuario.model';

@Module({
  imports: [TypeOrmModule.forFeature([ObjetivoUsuario])],
  controllers: [ObjetivoUsuarioController],
  providers: [ObjetivoUsuarioService],
  exports: [ObjetivoUsuarioService],
})
export class ObjetivoUsuarioModule {}
