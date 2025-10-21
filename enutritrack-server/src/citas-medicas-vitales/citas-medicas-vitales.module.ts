import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitaMedicaVitales } from './models/citas-medicas-vitales.model';

@Module({
  imports: [TypeOrmModule.forFeature([CitaMedicaVitales])],
  exports: [TypeOrmModule],
})
export class CitasMedicasVitalesModule {}
