import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { metricsRegistry } from '@sima/shared';

@Controller()
export class MetricsController {
  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    res.setHeader('Content-Type', metricsRegistry.contentType);
    const metrics = await metricsRegistry.metrics();
    res.send(metrics);
  }
}
