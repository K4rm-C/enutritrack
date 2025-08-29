import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Esto hace que el repositorio de User esté disponible para inyección en el módulo
  providers: [UserService],
  controllers: [UsersController], // Si tienes controlador
  exports: [UserService], // Si otros módulos necesitan usar UserService
})
export class UserModule {}
