import { All, Controller, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller()
export class GatewayController {
  private readonly serviceUrls = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    users: process.env.USERS_SERVICE_URL || 'http://localhost:3002',
    assets: process.env.ASSETS_SERVICE_URL || 'http://localhost:3003',
    audit: process.env.AUDIT_SERVICE_URL || 'http://localhost:3004',
    iot: process.env.IOT_SERVICE_URL || 'http://localhost:3005',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3006',
    reports: process.env.REPORTS_SERVICE_URL || 'http://localhost:3007',
    storage: process.env.STORAGE_SERVICE_URL || 'http://localhost:3008',
  } as const;

  constructor(private readonly proxyService: ProxyService) {}

  @All('auth')
  @All('auth/(.*)')
  handleAuth(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.auth, path);
  }

  @All('users')
  @All('users/(.*)')
  handleUsers(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.users, path);
  }

  @All('assets')
  @All('assets/(.*)')
  handleAssets(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.assets, path);
  }

  @All('audit')
  @All('audit/(.*)')
  handleAudit(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.audit, path);
  }

  @All('iot')
  @All('iot/(.*)')
  handleIot(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.iot, path);
  }

  @All('notifications')
  @All('notifications/(.*)')
  handleNotifications(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.notifications, path);
  }

  @All('reports')
  @All('reports/(.*)')
  handleReports(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.reports, path);
  }

  @All('storage')
  @All('storage/(.*)')
  handleStorage(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.storage, path);
  }
}
