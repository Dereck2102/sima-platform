import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { httpRequestDurationSeconds } from '../metrics/metrics.registry';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const endTimer = httpRequestDurationSeconds.startTimer({
      method: req.method,
    });

    res.on('finish', () => {
      const path = req.route?.path || req.originalUrl || req.url || 'unknown';
      endTimer({
        method: req.method,
        path,
        status_code: res.statusCode,
      });
    });

    next();
  }
}
