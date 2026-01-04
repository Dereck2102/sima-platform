import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.appService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.appService.login(dto);
  }
}