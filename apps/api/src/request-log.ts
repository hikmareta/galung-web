import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = randomUUID();
    res.setHeader('X-Request-ID', requestId);
    const started = Date.now();
    res.on('finish', () => {
      process.stdout.write(JSON.stringify({ level: 'info', event: 'http.request', requestId, method: req.method, route: req.path, status: res.statusCode, durationMs: Date.now() - started, time: new Date().toISOString() }) + '\n');
    });
    next();
  }
}
