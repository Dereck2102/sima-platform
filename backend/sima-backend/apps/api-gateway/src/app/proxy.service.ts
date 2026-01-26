import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  async forward(req: Request, res: Response, baseUrl: string, path = ''): Promise<void> {
    const targetUrl = this.buildUrl(baseUrl, path);

    const config: AxiosRequestConfig = {
      method: req.method as Method,
      url: targetUrl,
      headers: this.sanitizeHeaders(req.headers),
      params: req.query,
      data: req.body,
      validateStatus: () => true,
    };

    try {
      const response = await axios.request(config);

      Object.entries(response.headers ?? {}).forEach(([key, value]) => {
        if (key.toLowerCase() === 'transfer-encoding') {
          return;
        }
        res.setHeader(key, String(value));
      });

      res.status(response.status).send(response.data);
    } catch (error: any) {
      const status = error?.response?.status ?? 502;
      const details = error?.response?.data ?? { message: error?.message ?? 'Gateway error' };
      this.logger.error(`Proxy error to ${targetUrl}: ${error?.message ?? error}`);
      res.status(status).json({ message: 'Gateway error', target: targetUrl, details });
    }
  }

  private buildUrl(baseUrl: string, path: string): string {
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const normalizedPath = (path || '').replace(/^\/+/, '');
    return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
  }

  private sanitizeHeaders(headers: IncomingHttpHeaders): Record<string, string | string[]> {
    const hopByHop = new Set([
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailer',
      'transfer-encoding',
      'upgrade',
      'host',
      'content-length',
    ]);

    return Object.entries(headers).reduce<Record<string, string | string[]>>((acc, [key, value]) => {
      if (!value || hopByHop.has(key.toLowerCase())) {
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});
  }
}
