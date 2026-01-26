import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadFileDto } from '../dtos/upload-file.dto';
import { FileEntity } from '../entities/file.entity';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
  ) {}

  async upload(dto: UploadFileDto, uploadedBy?: string) {
    const entity = this.filesRepository.create({
      filename: dto.filename,
      mimeType: dto.mimeType,
      size: dto.size,
      description: dto.description,
      url: `/storage/files/${Date.now()}`,
      uploadedBy: uploadedBy ?? null,
    });

    const saved = await this.filesRepository.save(entity);
    return {
      ...saved,
      createdAt: saved.createdAt?.toISOString?.() ?? saved.createdAt,
      updatedAt: saved.updatedAt?.toISOString?.() ?? saved.updatedAt,
    };
  }

  async getFile(fileId: string) {
    const file = await this.filesRepository.findOne({ where: { id: fileId } });
    return file ?? null;
  }

  async deleteFile(fileId: string) {
    const file = await this.filesRepository.findOne({ where: { id: fileId } });
    if (!file) {
      return { id: fileId, deleted: false };
    }

    await this.filesRepository.remove(file);
    return { id: fileId, deleted: true, deletedAt: new Date().toISOString() };
  }

  async listFiles() {
    const files = await this.filesRepository.find({ order: { createdAt: 'DESC' } });
    return {
      total: files.length,
      files,
    };
  }
}
