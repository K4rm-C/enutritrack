// src/citas-medicas/citas-medicas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasMedicasService } from './citas-medicas.service';
import { CitasMedicasController } from './citas-medicas.controller';
import { CitaMedica } from './models/cita-medica.model';
import { EstadoCita } from './models/estado-cita.model';
import { TipoConsulta } from './models/tipo-consulta.model';
import { User } from '../users/models/user.model'; // CAMBIADO
import { Doctor } from '../doctor/models/doctor.model'; // CAMBIADO

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CitaMedica,
      EstadoCita,
      TipoConsulta,
      User, // CAMBIADO
      Doctor, // CAMBIADO
    ]),
  ],
  controllers: [CitasMedicasController],
  providers: [CitasMedicasService],
  exports: [CitasMedicasService],
})
export class CitasMedicasModule {}
