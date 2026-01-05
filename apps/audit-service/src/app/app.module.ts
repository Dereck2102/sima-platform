import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {

        const user = config.get<string>('MONGO_INITDB_ROOT_USERNAME') || 'root';
        const pass = config.get<string>('MONGO_INITDB_ROOT_PASSWORD') || 'password123';
        const host = '127.0.0.1:27017'; 
        const dbName = 'sima_audit';

        const uri = `mongodb://${user}:${pass}@${host}/${dbName}?authSource=admin&directConnection=true`;
        
        Logger.log(` Mongo URI: mongodb://${user}:****@${host}/${dbName}?authSource=admin`, 'MongooseModule');
        
        return { uri };
      },
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}