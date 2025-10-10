import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { PerfilAdminModule } from './admin/admin.module';
import { PerfilDoctorModule } from './doctor/doctor.module';
import { PerfilUsuarioModule } from './users/user.module';
import { TiposActividadModule } from './tipo-actividad/tipo-actividad.module';
import { AlimentosModule } from './alimento/alimento.module';
import { TiposRecomendacionModule } from './tipo-recomendacion/tipo-recomendacion.module';
import { ObjetivoUsuarioModule } from './objetivo-usuario/objetivo-usuario.module';
import { HistorialPesoModule } from './historial-peso/historial-peso.module';
import { CondicionesMedicasModule } from './condicion-medica/condicion-medica.module';
import { AlergiasModule } from './alergia/alergia.module';
import { MedicamentosModule } from './medicamento/medicamento.module';
import { PhysicalActivityModule } from './activity/activity.module';
import { RegistroComidaModule } from './nutrition/nutrition.module';
import { RegistroComidaItemsModule } from './registro-comida-item/registro-comida-item.module';
import { RecomendacionModule } from './recommendation/recommendation.module';
import { RecomendacionDatosModule } from './recomendacion-dato/recomendacion-dato.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: '1234',
      database: 'enutritrack',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    CuentasModule,
    PerfilAdminModule,
    PerfilDoctorModule,
    PerfilUsuarioModule,
    TiposActividadModule,
    AlimentosModule,
    TiposRecomendacionModule,
    ObjetivoUsuarioModule,
    HistorialPesoModule,
    CondicionesMedicasModule,
    AlergiasModule,
    MedicamentosModule,
    PhysicalActivityModule,
    RegistroComidaModule,
    RegistroComidaItemsModule,
    RecomendacionModule,
    RecomendacionDatosModule,
  ],
})
export class AppModule {}
