import { 
  Controller, Post, Get, Delete, Param, Query, Headers, 
  UploadedFile, UseInterceptors, UnauthorizedException, Res 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { StorageBucket } from './storage.dto';

@ApiTags('Storage')
@ApiBearerAuth('JWT-auth')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload/:bucket')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        path: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @Param('bucket') bucket: StorageBucket,
    @UploadedFile() file: Express.Multer.File,
    @Query('path') customPath: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.storageService.uploadFile(file, bucket, tenantId, customPath);
  }

  @Get(':bucket/:key(*)')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: 200, description: 'File content' })
  async downloadFile(
    @Param('bucket') bucket: StorageBucket,
    @Param('key') key: string,
    @Headers('x-tenant-id') tenantId: string,
    @Res() res: Response,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    const metadata = await this.storageService.getFileMetadata(bucket, key, tenantId);
    const data = await this.storageService.getFile(bucket, key, tenantId);
    
    res.set({
      'Content-Type': metadata.contentType,
      'Content-Length': metadata.size,
      'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`,
    });
    res.send(data);
  }

  @Get(':bucket')
  @ApiOperation({ summary: 'List files in bucket' })
  @ApiQuery({ name: 'prefix', required: false })
  @ApiResponse({ status: 200, description: 'List of files' })
  async listFiles(
    @Param('bucket') bucket: StorageBucket,
    @Query('prefix') prefix: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.storageService.listFiles(bucket, tenantId, prefix);
  }

  @Delete(':bucket/:key(*)')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  async deleteFile(
    @Param('bucket') bucket: StorageBucket,
    @Param('key') key: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    await this.storageService.deleteFile(bucket, key, tenantId);
    return { success: true };
  }

  @Get('presigned/upload/:bucket/:filename')
  @ApiOperation({ summary: 'Get presigned URL for upload' })
  @ApiResponse({ status: 200, description: 'Presigned upload URL' })
  async getPresignedUploadUrl(
    @Param('bucket') bucket: StorageBucket,
    @Param('filename') filename: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.storageService.getPresignedUploadUrl(bucket, filename, tenantId);
  }

  @Get('presigned/download/:bucket/:key(*)')
  @ApiOperation({ summary: 'Get presigned URL for download' })
  @ApiResponse({ status: 200, description: 'Presigned download URL' })
  async getPresignedDownloadUrl(
    @Param('bucket') bucket: StorageBucket,
    @Param('key') key: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.storageService.getPresignedDownloadUrl(bucket, key, tenantId);
  }
}
