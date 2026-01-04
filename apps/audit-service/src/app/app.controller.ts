import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  

  @EventPattern('asset.created')
  handleAssetCreated(@Payload() data: any) {
    console.log('⚡ EVENT RECEIVED in Audit Service:');
    console.log(data);
    

  }
}
