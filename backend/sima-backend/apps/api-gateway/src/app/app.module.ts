import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyService } from './proxy.service';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [],
  controllers: [AppController, GatewayController],
  providers: [AppService, ProxyService],
})
export class AppModule {}
