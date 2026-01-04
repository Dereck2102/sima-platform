import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Asset } from './entities/asset.entity';
import { AuthLibModule } from '@sima-platform/auth-lib';
@Module({
  imports: [
    AuthLibModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Docker expone el puerto 5432 en localhost
      port: 5432,
      username: 'sima',      // Definido en docker-compose.yml
      password: 'password123', // Definido en docker-compose.yml
      database: 'sima_core',   // Definido en docker-compose.yml
      entities: [Asset], // ¡Aquí cargamos tu entidad de Activos!
      synchronize: true, // AUTO-SCHEMA: Esto creará la tabla automáticamente (Solo dev)
    }),
    TypeOrmModule.forFeature([Asset]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
