import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasMedicasService } from './citas-medicas.service';
import { CitasMedicasController } from './citas-medicas.controller';
import { CitaMedica } from './models/citas-medicas.model';
import { CitasMedicasVitalesModule } from '../citas-medicas-vitales/citas-medicas-vitales.module';
import { CitasMedicasDocumentosModule } from '../citas-medicas-documentos/citas-medicas-documentos.module';
import { CitaMedicaVitales } from '../citas-medicas-vitales/models/citas-medicas-vitales.model';
import { CitaMedicaDocumentos } from '../citas-medicas-documentos/models/citas-medicas-documentos.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CitaMedica,
      CitaMedicaVitales,
      CitaMedicaDocumentos
    ]),
    CitasMedicasVitalesModule,
    CitasMedicasDocumentosModule
  ],
  controllers: [CitasMedicasController],
  providers: [CitasMedicasService],
  exports: [CitasMedicasService],
})
export class CitasMedicasModule {}
