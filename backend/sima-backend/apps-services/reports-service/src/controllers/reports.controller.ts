import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@sima/shared';
import { CreateReportDto } from '../dtos/create-report.dto';
import { ExportReportDto } from '../dtos/export-report.dto';
import { ReportsService } from '../services/reports.service';
import { UserRole } from '@sima/users';
import { Request } from 'express';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Create a new report' })
  async create(@Body() createReportDto: CreateReportDto, @Req() req: Request) {
    const userId = (req as any).user?.sub;
    return this.reportsService.createReport(createReportDto, userId);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Get all reports' })
  async findAll() {
    return this.reportsService.listReports();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Get report by id' })
  async findOne(@Param('id') id: string) {
    return this.reportsService.getReport(id);
  }

  @Post(':id/export')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Export report' })
  async export(@Param('id') id: string, @Body() exportDto: ExportReportDto) {
    return this.reportsService.exportReport(id, exportDto);
  }
}
