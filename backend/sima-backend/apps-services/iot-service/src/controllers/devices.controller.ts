import { Controller, Get, Post, Body, Patch, Param, Logger, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@sima/shared';
import { UserRole } from '@sima/users';
import { DevicesService } from '../services/devices.service';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { UpdateDeviceDto } from '../dto/update-device.dto';
import { TelemetryDto } from '../dto/telemetry.dto';
import { Device } from '../entities/device.entity';

@ApiTags('devices')
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  private readonly logger = new Logger(DevicesController.name);

  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'List devices' })
  async findAll(): Promise<{ devices: Device[]; total: number }> {
    return this.devicesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Register device' })
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<Device> {
    return this.devicesService.registerDevice(createDeviceDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get device by ID' })
  async findOne(@Param('id') id: string): Promise<Device> {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update device' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDeviceDto): Promise<Device> {
    return this.devicesService.update(id, updateDto);
  }

  @Post(':id/telemetry')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Record telemetry for a device' })
  async recordTelemetry(@Param('id') id: string, @Body() telemetryData: TelemetryDto) {
    return this.devicesService.recordTelemetry(id, telemetryData);
  }

  @Get(':id/telemetry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get telemetry for a device' })
  async getTelemetry(@Param('id') id: string) {
    // Placeholder until persistence is added
    return { deviceId: id, data: [] };
  }
}
