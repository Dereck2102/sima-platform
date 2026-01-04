
import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { JwtAuthGuard } from '@sima-platform/auth-lib';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getHello();
  }

  
  @UseGuards(JwtAuthGuard)
  @Post('assets')
  create(@Body() createAssetDto: CreateAssetDto, @Request() req) {

    const user = req.user;
    

    createAssetDto.tenantId = user.tenantId;

    return this.appService.createAsset(createAssetDto);
  }
}
