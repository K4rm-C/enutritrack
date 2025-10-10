import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilAdminService } from './admin.service';
import { PerfilAdminController } from './admin.controller';
import { PerfilAdmin } from './models/admin.model';
import { CuentasModule } from '../cuentas/cuentas.module';
import { AuthModule } from '../auth/auth.module'; // Importar AuthModule

@Module({
  imports: [TypeOrmModule.forFeature([PerfilAdmin]), CuentasModule, AuthModule],
  controllers: [PerfilAdminController],
  providers: [PerfilAdminService],
  exports: [PerfilAdminService],
})
export class PerfilAdminModule {}
