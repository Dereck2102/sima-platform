import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageBucket, FileMetadata, PresignedUrlResponse } from './storage.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  
  // In-memory store for demo (in production: MinIO client)
  private files: Map<string, FileMetadata & { tenantId: string; data: Buffer }> = new Map();
  
  private readonly minioEndpoint: string;
  
  constructor(private configService: ConfigService) {
    this.minioEndpoint = this.configService.get('MINIO_ENDPOINT') || 'http://localhost:9000';
  }

  async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    bucket: StorageBucket,
    tenantId: string,
    customPath?: string,
  ): Promise<FileMetadata> {
    const key = customPath || `${tenantId}/${uuidv4()}-${file.originalname}`;
    
    this.logger.log(`📤 Uploading file: ${key} to bucket: ${bucket}`);

    // In production: use MinIO client
    // await this.minioClient.putObject(bucket, key, file.buffer);
    
    const metadata: FileMetadata & { tenantId: string; data: Buffer } = {
      key,
      bucket,
      size: file.size,
      contentType: file.mimetype,
      uploadedAt: new Date(),
      url: `${this.minioEndpoint}/${bucket}/${key}`,
      tenantId,
      data: file.buffer,
    };

    this.files.set(`${bucket}/${key}`, metadata);

    return {
      key,
      bucket,
      size: file.size,
      contentType: file.mimetype,
      uploadedAt: metadata.uploadedAt,
      url: metadata.url,
    };
  }

  async getFile(bucket: StorageBucket, key: string, tenantId: string): Promise<Buffer> {
    const fileKey = `${bucket}/${key}`;
    const file = this.files.get(fileKey);
    
    if (!file || file.tenantId !== tenantId) {
      throw new NotFoundException(`File not found: ${key}`);
    }

    return file.data;
  }

  async getFileMetadata(bucket: StorageBucket, key: string, tenantId: string): Promise<FileMetadata> {
    const fileKey = `${bucket}/${key}`;
    const file = this.files.get(fileKey);
    
    if (!file || file.tenantId !== tenantId) {
      throw new NotFoundException(`File not found: ${key}`);
    }

    return {
      key: file.key,
      bucket: file.bucket,
      size: file.size,
      contentType: file.contentType,
      uploadedAt: file.uploadedAt,
      url: file.url,
    };
  }

  async deleteFile(bucket: StorageBucket, key: string, tenantId: string): Promise<boolean> {
    const fileKey = `${bucket}/${key}`;
    const file = this.files.get(fileKey);
    
    if (!file || file.tenantId !== tenantId) {
      throw new NotFoundException(`File not found: ${key}`);
    }

    this.logger.log(`🗑️ Deleting file: ${key} from bucket: ${bucket}`);
    this.files.delete(fileKey);
    return true;
  }

  async listFiles(bucket: StorageBucket, tenantId: string, prefix?: string): Promise<FileMetadata[]> {
    const files = Array.from(this.files.values())
      .filter(f => f.bucket === bucket && f.tenantId === tenantId)
      .filter(f => !prefix || f.key.startsWith(prefix))
      .map(f => ({
        key: f.key,
        bucket: f.bucket,
        size: f.size,
        contentType: f.contentType,
        uploadedAt: f.uploadedAt,
        url: f.url,
      }));

    return files;
  }

  async getPresignedUploadUrl(
    bucket: StorageBucket,
    key: string,
    tenantId: string,
    expiresInSeconds = 3600,
  ): Promise<PresignedUrlResponse> {
    // In production: use MinIO presignedPutObject
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    
    return {
      url: `${this.minioEndpoint}/${bucket}/${tenantId}/${key}?X-Amz-Expires=${expiresInSeconds}`,
      expiresAt,
      key: `${tenantId}/${key}`,
    };
  }

  async getPresignedDownloadUrl(
    bucket: StorageBucket,
    key: string,
    tenantId: string,
    expiresInSeconds = 3600,
  ): Promise<PresignedUrlResponse> {
    const fileKey = `${bucket}/${key}`;
    const file = this.files.get(fileKey);
    
    if (!file || file.tenantId !== tenantId) {
      throw new NotFoundException(`File not found: ${key}`);
    }

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    
    return {
      url: `${this.minioEndpoint}/${bucket}/${key}?X-Amz-Expires=${expiresInSeconds}`,
      expiresAt,
      key,
    };
  }
}
