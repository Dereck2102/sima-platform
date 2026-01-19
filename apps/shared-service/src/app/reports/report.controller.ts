import { Controller, Post, Get, Param, Body, Headers, UnauthorizedException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportService } from './report.service';
import { GenerateReportDto } from './report.dto';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiResponse({ status: 201, description: 'Report job created' })
  async generateReport(
    @Body() dto: GenerateReportDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.reportService.generateReport(dto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List all reports for tenant' })
  @ApiResponse({ status: 200, description: 'List of report jobs' })
  async listReports(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.reportService.listReports(tenantId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get report job status' })
  @ApiResponse({ status: 200, description: 'Report job status' })
  async getReportStatus(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.reportService.getReportStatus(id, tenantId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download report data' })
  @ApiResponse({ status: 200, description: 'Report data (JSON)' })
  async downloadReport(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Res() res: Response,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    const data = await this.reportService.getReportData(id, tenantId);
    res.json(data);
  }
}
