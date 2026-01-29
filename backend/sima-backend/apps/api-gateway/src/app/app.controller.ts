import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { currentUser, dashboardData } from './demo-data';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  // Temporary placeholder endpoints to satisfy frontend calls.
  @Get('me')
  getMe() {
    return currentUser();
  }

  @Get('dashboard')
  getDashboard() {
    return dashboardData();
  }
}
