import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, of } from 'rxjs';

export interface DashboardData {
  user: UserInfo | null;
  stats: DashboardStats;
  recentAssets: AssetSummary[];
  notifications: NotificationItem[];
  generatedAt: string;
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
}

export interface DashboardStats {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  totalValue: number;
  assetsThisMonth: number;
}

export interface AssetSummary {
  id: string;
  name: string;
  status: string;
  condition: string;
  price: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  
  private readonly authServiceUrl: string;
  private readonly inventoryServiceUrl: string;
  private readonly analyticsServiceUrl: string;
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.authServiceUrl = this.configService.get('AUTH_SERVICE_URL', 'http://localhost:3002');
    this.inventoryServiceUrl = this.configService.get('INVENTORY_SERVICE_URL', 'http://localhost:3001');
    this.analyticsServiceUrl = this.configService.get('ANALYTICS_SERVICE_URL', 'http://localhost:3010');
    this.notificationServiceUrl = this.configService.get('NOTIFICATION_SERVICE_URL', 'http://localhost:3006');
  }

  async getDashboard(token: string, tenantId: string): Promise<DashboardData> {
    const cacheKey = `dashboard:${tenantId}`;
    
    // Try to get from cache first
    const cached = await this.cacheManager.get<DashboardData>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    // Fetch all data in parallel
    const [user, stats, recentAssets, notifications] = await Promise.all([
      this.fetchUserInfo(token),
      this.fetchStats(tenantId),
      this.fetchRecentAssets(tenantId),
      this.fetchNotifications(tenantId),
    ]);

    const dashboard: DashboardData = {
      user,
      stats,
      recentAssets,
      notifications,
      generatedAt: new Date().toISOString(),
    };

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, dashboard, 60000);
    
    return dashboard;
  }

  async getStats(tenantId: string): Promise<DashboardStats> {
    const cacheKey = `stats:${tenantId}`;
    
    const cached = await this.cacheManager.get<DashboardStats>(cacheKey);
    if (cached) {
      return cached;
    }

    const stats = await this.fetchStats(tenantId);
    await this.cacheManager.set(cacheKey, stats, 30000); // Cache for 30 seconds
    
    return stats;
  }

  async getRecentAssets(tenantId: string, limit: number = 10): Promise<AssetSummary[]> {
    const cacheKey = `recent-assets:${tenantId}:${limit}`;
    
    const cached = await this.cacheManager.get<AssetSummary[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const assets = await this.fetchRecentAssets(tenantId, limit);
    await this.cacheManager.set(cacheKey, assets, 120000); // Cache for 2 minutes
    
    return assets;
  }

  private async fetchUserInfo(token: string): Promise<UserInfo | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/auth/profile`, {
          headers: { Authorization: token },
        }).pipe(
          catchError((error) => {
            this.logger.warn(`Failed to fetch user info: ${error.message}`);
            return of({ data: null });
          }),
        ),
      );
      return response.data;
    } catch {
      return null;
    }
  }

  private async fetchStats(tenantId: string): Promise<DashboardStats> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.analyticsServiceUrl}/api/analytics/assets/summary`, {
          headers: { 'x-tenant-id': tenantId },
        }).pipe(
          catchError((error) => {
            this.logger.warn(`Failed to fetch analytics: ${error.message}`);
            return of({ data: null });
          }),
        ),
      );

      if (response.data) {
        const data = response.data;
        return {
          totalAssets: data.total_assets || 0,
          activeAssets: data.assets_by_status?.ACTIVE || 0,
          maintenanceAssets: data.assets_by_status?.IN_MAINTENANCE || 0,
          totalValue: data.total_value || 0,
          assetsThisMonth: 0, // TODO: Get from trends endpoint
        };
      }
    } catch {
      // Fallback to inventory service
    }

    // Fallback: fetch directly from inventory
    return this.fetchStatsFromInventory(tenantId);
  }

  private async fetchStatsFromInventory(tenantId: string): Promise<DashboardStats> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.inventoryServiceUrl}/api/assets`, {
          headers: { 'x-tenant-id': tenantId },
        }).pipe(
          catchError(() => of({ data: [] })),
        ),
      );

      const assets = response.data || [];
      const activeAssets = assets.filter((a: any) => a.status === 'ACTIVE').length;
      const maintenanceAssets = assets.filter((a: any) => a.status === 'IN_MAINTENANCE').length;
      const totalValue = assets.reduce((sum: number, a: any) => sum + (a.price || 0), 0);

      return {
        totalAssets: assets.length,
        activeAssets,
        maintenanceAssets,
        totalValue,
        assetsThisMonth: 0,
      };
    } catch {
      return {
        totalAssets: 0,
        activeAssets: 0,
        maintenanceAssets: 0,
        totalValue: 0,
        assetsThisMonth: 0,
      };
    }
  }

  private async fetchRecentAssets(tenantId: string, limit: number = 10): Promise<AssetSummary[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.inventoryServiceUrl}/api/assets`, {
          headers: { 'x-tenant-id': tenantId },
        }).pipe(
          catchError(() => of({ data: [] })),
        ),
      );

      const assets = response.data || [];
      
      // Sort by updatedAt descending and take limit
      return assets
        .sort((a: any, b: any) => 
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        )
        .slice(0, limit)
        .map((asset: any) => ({
          id: asset.id,
          name: asset.name,
          status: asset.status,
          condition: asset.condition,
          price: asset.price || 0,
          updatedAt: asset.updatedAt || asset.createdAt,
        }));
    } catch {
      return [];
    }
  }

  private async fetchNotifications(tenantId: string): Promise<NotificationItem[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.notificationServiceUrl}/api/notifications`, {
          headers: { 'x-tenant-id': tenantId },
          params: { limit: 5, unread: true },
        }).pipe(
          catchError(() => of({ data: [] })),
        ),
      );

      return response.data || [];
    } catch {
      return [];
    }
  }

  async invalidateCache(tenantId: string): Promise<void> {
    await Promise.all([
      this.cacheManager.del(`dashboard:${tenantId}`),
      this.cacheManager.del(`stats:${tenantId}`),
      this.cacheManager.del(`recent-assets:${tenantId}:10`),
    ]);
    this.logger.log(`Cache invalidated for tenant ${tenantId}`);
  }
}
