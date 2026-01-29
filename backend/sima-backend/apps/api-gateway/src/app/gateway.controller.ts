import { All, Controller, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import {
  addAsset,
  addReport,
  addUser,
  dashboardData,
  deleteAsset,
  deleteReport,
  deleteUser,
  getSettings,
  listAssets,
  listReports,
  listUsers,
  updateAsset,
  updateReport,
  updateSettings,
  updateUser,
} from './demo-data';

@Controller()
export class GatewayController {
  private readonly useStubData = process.env.USE_STUB_DATA !== 'false';

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

  private sendStub(res: Response, payload: unknown) {
    return res.status(200).json(payload);
  }

  @All('auth')
  @All('auth/(.*)')
  handleAuth(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.auth, path);
  }

  @All('users')
  @All('users/(.*)')
  handleUsers(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    if (this.useStubData) {
      if (req.method === 'GET' && !path) {
        return this.sendStub(res, { users: listUsers() });
      }
      if (req.method === 'POST' && !path) {
        return this.sendStub(res, addUser(req.body || {}));
      }
      if (req.method === 'PATCH' && path) {
        const updated = updateUser(path, req.body || {});
        return updated ? this.sendStub(res, updated) : res.status(404).json({ message: 'User not found' });
      }
      if (req.method === 'DELETE' && path) {
        const ok = deleteUser(path);
        return ok ? res.status(204).send() : res.status(404).json({ message: 'User not found' });
      }
    }
    return this.proxyService.forward(req, res, this.serviceUrls.users, path);
  }

  @All('assets')
  @All('assets/(.*)')
  handleAssets(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    if (this.useStubData) {
      if (req.method === 'GET' && !path) {
        return this.sendStub(res, { stats: dashboardData().stats.slice(1, 3), assets: listAssets() });
      }
      if (req.method === 'POST' && !path) {
        return this.sendStub(res, addAsset(req.body || {}));
      }
      if (req.method === 'PATCH' && path) {
        const updated = updateAsset(path, req.body || {});
        return updated ? this.sendStub(res, updated) : res.status(404).json({ message: 'Asset not found' });
      }
      if (req.method === 'DELETE' && path) {
        const ok = deleteAsset(path);
        return ok ? res.status(204).send() : res.status(404).json({ message: 'Asset not found' });
      }
    }
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
    if (this.useStubData) {
      if (req.method === 'GET' && !path) {
        return this.sendStub(res, { reports: listReports() });
      }
      if (req.method === 'POST' && !path) {
        return this.sendStub(res, addReport(req.body || {}));
      }
      if (req.method === 'PATCH' && path) {
        const updated = updateReport(path, req.body || {});
        return updated ? this.sendStub(res, updated) : res.status(404).json({ message: 'Report not found' });
      }
      if (req.method === 'DELETE' && path) {
        const ok = deleteReport(path);
        return ok ? res.status(204).send() : res.status(404).json({ message: 'Report not found' });
      }
    }
    return this.proxyService.forward(req, res, this.serviceUrls.reports, path);
  }

  @All('settings')
  @All('settings/(.*)')
  handleSettings(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    if (this.useStubData) {
      const userId = path || 'u1';
      if (req.method === 'GET') {
        return this.sendStub(res, getSettings(userId));
      }
      if (req.method === 'PUT' || req.method === 'PATCH') {
        return this.sendStub(res, updateSettings(userId, req.body || {}));
      }
    }
    return this.proxyService.forward(req, res, this.serviceUrls.auth, path);
  }

  @All('storage')
  @All('storage/(.*)')
  handleStorage(@Req() req: Request, @Res() res: Response, @Param('0') path?: string) {
    return this.proxyService.forward(req, res, this.serviceUrls.storage, path);
  }
}
