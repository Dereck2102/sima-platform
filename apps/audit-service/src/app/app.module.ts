import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';

@Module({
  imports: [
    // CORRECCIÓN: Usamos conexión directa sin usuario/pass para desarrollo local
    MongooseModule.forRoot('mongodb://localhost:27017/sima_audit'),

    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
