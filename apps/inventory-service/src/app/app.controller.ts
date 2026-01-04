import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getHello();
  }

  @Post('assets')
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.appService.createAsset(createAssetDto);
  }
}
