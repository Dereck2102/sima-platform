import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { SoapController } from '../soap/soap.controller';

@Module({
  controllers: [ReportController, SoapController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
