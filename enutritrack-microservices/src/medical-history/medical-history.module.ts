// src/medical-history/medical-history.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistoryService } from './medical-history.service';
import { MedicalHistoryController } from './medical-history.controller';
import { MedicalHistory } from './model/medical-history.model';
import { Alergia } from './model/alergia.model';
import { CondicionMedica } from './model/condicion-medica.model';
import { Medicamento } from './model/medicamento.model';
import { User } from '../users/models/user.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalHistory,
      Alergia,
      CondicionMedica,
      Medicamento,
      User,
    ]),
    AuthModule,
  ],
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService],
  exports: [MedicalHistoryService],
})
export class MedicalHistoryModule {}
