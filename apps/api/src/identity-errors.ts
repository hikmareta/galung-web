import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class IdentityErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request & { requestId?: string }>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const custom = payload && typeof payload === 'object' && 'error' in payload && payload.error && typeof payload.error === 'object'
      && 'code' in payload.error && typeof payload.error.code === 'string' && /^[A-Z_]+$/.test(payload.error.code) ? payload.error.code : null;
    const code = custom ?? ({ 400: 'INVALID_INPUT', 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 429: 'RATE_LIMITED', 503: 'SERVICE_UNAVAILABLE' } as Record<number, string>)[status] ?? 'INTERNAL_ERROR';
    response.status(status).json({ error: { code, message: code }, requestId: request.requestId ?? 'unavailable' });
  }
}
