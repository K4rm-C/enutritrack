import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilDoctorService } from './doctor.service';
import { PerfilDoctorController } from './doctor.controller';
import { PerfilDoctor } from './models/doctor.model';
import { CuentasModule } from '../cuentas/cuentas.module';
import { PerfilAdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module'; // Importar AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([PerfilDoctor]),
    CuentasModule,
    PerfilAdminModule,
    AuthModule, // Para que AdminAuthGuard pueda usar AuthService
  ],
  controllers: [PerfilDoctorController],
  providers: [PerfilDoctorService],
  exports: [PerfilDoctorService],
})
export class PerfilDoctorModule {}
