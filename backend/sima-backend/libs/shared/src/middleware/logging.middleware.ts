import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as pino from 'pino';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = pino.default();

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.info({
        method,
        url: originalUrl,
        ip,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent'),
      });
    });

    next();
  }
}
