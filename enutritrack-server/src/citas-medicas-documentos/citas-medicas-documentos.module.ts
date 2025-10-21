import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitaMedicaDocumentos } from './models/citas-medicas-documentos.model';

@Module({
  imports: [TypeOrmModule.forFeature([CitaMedicaDocumentos])],
  exports: [TypeOrmModule],
})
export class CitasMedicasDocumentosModule {}
