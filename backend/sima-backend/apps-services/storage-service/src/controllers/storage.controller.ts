import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@sima/shared';
import { UserRole } from '@sima/users';
import { UploadFileDto } from '../dtos/upload-file.dto';
import { StorageService } from '../services/storage.service';
import { Request } from 'express';

@ApiTags('storage')
@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Upload a file' })
  async upload(@Body() dto: UploadFileDto, @Req() req: Request) {
    const userId = (req as any).user?.sub;
    return this.storageService.upload(dto, userId);
  }

  @Get(':fileId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get file info' })
  async getFile(@Param('fileId') fileId: string) {
    return this.storageService.getFile(fileId);
  }

  @Delete(':fileId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a file' })
  async deleteFile(@Param('fileId') fileId: string) {
    return this.storageService.deleteFile(fileId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'List all files' })
  async listFiles() {
    return this.storageService.listFiles();
  }
}
