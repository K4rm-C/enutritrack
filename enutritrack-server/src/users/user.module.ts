import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilUsuarioService } from './user.service';
import { PerfilUsuarioController } from './user.controller';
import { PerfilUsuario } from './models/user.model';

@Module({
  imports: [TypeOrmModule.forFeature([PerfilUsuario])],
  controllers: [PerfilUsuarioController],
  providers: [PerfilUsuarioService],
  exports: [PerfilUsuarioService],
})
export class PerfilUsuarioModule {}
