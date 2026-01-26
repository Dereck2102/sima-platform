import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto, ReportType } from '../dtos/create-report.dto';
import { ExportReportDto } from '../dtos/export-report.dto';
import { Report, ReportStatus } from '../entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
  ) {}

  async createReport(dto: CreateReportDto, requestedBy?: string) {
    const report = this.reportsRepository.create({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      status: ReportStatus.PROCESSING,
      requestedBy: requestedBy ?? null,
      parameters: dto.parameters ?? {},
    });

    const saved = await this.reportsRepository.save(report);

    return {
      ...saved,
      createdAt: saved.createdAt?.toISOString?.() ?? saved.createdAt,
      updatedAt: saved.updatedAt?.toISOString?.() ?? saved.updatedAt,
    };
  }

  async listReports() {
    const reports = await this.reportsRepository.find({ order: { createdAt: 'DESC' } });
    return {
      total: reports.length,
      reports,
    };
  }

  async getReport(id: string) {
    const report = await this.reportsRepository.findOne({ where: { id } });
    if (!report) {
      return null;
    }
    return report;
  }

  async exportReport(id: string, dto: ExportReportDto) {
    await this.reportsRepository.update(id, {
      status: ReportStatus.QUEUED,
      downloadUrl: `/reports/files/${id}.${dto.format}`,
    });

    const updated = await this.reportsRepository.findOne({ where: { id } });

    return {
      id,
      format: dto.format,
      status: ReportStatus.QUEUED,
      deliveryEmail: dto.deliveryEmail ?? null,
      url: updated?.downloadUrl ?? `/reports/files/${id}.${dto.format}`,
      requestedAt: new Date().toISOString(),
    };
  }
}
