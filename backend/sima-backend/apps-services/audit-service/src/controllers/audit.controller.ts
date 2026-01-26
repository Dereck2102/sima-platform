import { Controller, Get, Post, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { JwtAuthGuard, RolesGuard, Roles } from '@sima/shared';
import { UserRole } from '@sima/users';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create audit log entry' })
  @ApiResponse({ status: 201, description: 'Audit log created' })
  async create(@Body() createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditService.log(createAuditLogDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditService.findAll(skip, take);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get audit logs by user' })
  async findByUserId(
    @Param('userId') userId: string,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditService.findByUserId(userId, skip, take);
  }

  @Get('action/:action')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get audit logs by action type' })
  async findByAction(
    @Param('action') action: AuditAction,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditService.findByAction(action, skip, take);
  }

  @Get('resource/:resourceType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get audit logs by resource type' })
  async findByResourceType(
    @Param('resourceType') resourceType: string,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditService.findByResourceType(resourceType, skip, take);
  }

  @Get('report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate audit report' })
  async generateReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.auditService.generateReport(new Date(startDate), new Date(endDate));
  }

  @Get('health/kafka')
  async kafkaHealth() {
    // TODO: Implement Kafka health check in Session 4
    return { status: 'ok', broker: process.env.KAFKA_BROKERS || 'localhost:9092' };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get audit log by ID' })
  async findOne(@Param('id') id: string): Promise<AuditLog> {
    return this.auditService.findOne(id);
  }
}
