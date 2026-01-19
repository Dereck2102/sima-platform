import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { 
  GenerateReportDto, ReportJob, ReportData,
  ReportType, ReportFormat, ReportStatus 
} from './report.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  
  // In-memory store for demo
  private jobs: Map<string, ReportJob> = new Map();
  private reportData: Map<string, unknown> = new Map();

  async generateReport(dto: GenerateReportDto, tenantId: string): Promise<ReportJob> {
    const jobId = uuidv4();
    
    this.logger.log(`📊 Generating ${dto.type} report (${dto.format}) for tenant: ${tenantId}`);

    const job: ReportJob = {
      id: jobId,
      type: dto.type,
      format: dto.format,
      status: ReportStatus.PROCESSING,
      tenantId,
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);

    // Simulate async report generation
    this.processReportAsync(jobId, dto, tenantId);

    return job;
  }

  private async processReportAsync(jobId: string, dto: GenerateReportDto, tenantId: string): Promise<void> {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock data based on report type
      const reportData = this.generateMockReportData(dto, tenantId);
      this.reportData.set(jobId, reportData);

      // Update job status
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = ReportStatus.COMPLETED;
        job.completedAt = new Date();
        job.downloadUrl = `/api/reports/${jobId}/download`;
      }

      this.logger.log(`✅ Report ${jobId} completed`);
    } catch (error) {
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = ReportStatus.FAILED;
        job.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
  }

  private generateMockReportData(dto: GenerateReportDto, tenantId: string): ReportData {
    const baseData: ReportData = {
      title: dto.title || this.getDefaultTitle(dto.type),
      generatedAt: new Date(),
      tenantId,
      summary: {},
      data: [],
    };

    switch (dto.type) {
      case ReportType.ASSET_INVENTORY:
        return {
          ...baseData,
          summary: {
            totalAssets: 156,
            activeAssets: 142,
            maintenanceAssets: 8,
            decommissioned: 6,
            totalValue: 245000,
          },
          data: [
            { id: '1', code: 'LAPTOP-001', name: 'Dell Latitude', status: 'ACTIVE', value: 1500 },
            { id: '2', code: 'MONITOR-001', name: 'Dell UltraSharp', status: 'ACTIVE', value: 800 },
            { id: '3', code: 'DESK-001', name: 'Escritorio Ergonómico', status: 'ACTIVE', value: 450 },
          ],
        };

      case ReportType.ASSET_BY_LOCATION:
        return {
          ...baseData,
          summary: { totalLocations: 12 },
          data: [
            { location: 'Lab 101', count: 25, value: 45000 },
            { location: 'Office 201', count: 18, value: 32000 },
            { location: 'Admin 301', count: 12, value: 28000 },
          ],
        };

      case ReportType.ASSET_VALUATION:
        return {
          ...baseData,
          summary: {
            totalValue: 245000,
            depreciatedValue: 185000,
            averageAge: 2.5,
          },
          data: [
            { category: 'Computers', count: 45, value: 67500, depreciation: 15000 },
            { category: 'Furniture', count: 60, value: 27000, depreciation: 8000 },
            { category: 'Equipment', count: 51, value: 150500, depreciation: 35000 },
          ],
        };

      default:
        return baseData;
    }
  }

  private getDefaultTitle(type: ReportType): string {
    const titles: Record<ReportType, string> = {
      [ReportType.ASSET_INVENTORY]: 'Inventario de Activos',
      [ReportType.ASSET_BY_LOCATION]: 'Activos por Ubicación',
      [ReportType.ASSET_BY_CUSTODIAN]: 'Activos por Custodio',
      [ReportType.ASSET_VALUATION]: 'Valoración de Activos',
      [ReportType.MAINTENANCE_HISTORY]: 'Historial de Mantenimiento',
      [ReportType.AUDIT_LOG]: 'Registro de Auditoría',
    };
    return titles[type];
  }

  async getReportStatus(jobId: string, tenantId: string): Promise<ReportJob> {
    const job = this.jobs.get(jobId);
    if (!job || job.tenantId !== tenantId) {
      throw new NotFoundException(`Report job not found: ${jobId}`);
    }
    return job;
  }

  async getReportData(jobId: string, tenantId: string): Promise<unknown> {
    const job = this.jobs.get(jobId);
    if (!job || job.tenantId !== tenantId) {
      throw new NotFoundException(`Report job not found: ${jobId}`);
    }
    if (job.status !== ReportStatus.COMPLETED) {
      throw new Error('Report not ready yet');
    }
    return this.reportData.get(jobId);
  }

  async listReports(tenantId: string): Promise<ReportJob[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
