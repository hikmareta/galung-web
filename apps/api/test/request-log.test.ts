import { EventEmitter } from 'node:events';
import { expect, test, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { RequestLogMiddleware } from '../src/request-log';

test('request log omits path, query and body while providing a request ID', () => {
  const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const response = Object.assign(new EventEmitter(), {
    statusCode: 200,
    setHeader: vi.fn(),
  });
  const request = { method: 'GET', path: '/secret-fixture', query: { token: 'secret-fixture' }, body: { password: 'secret-fixture' } };
  const next = vi.fn();
  try {
    new RequestLogMiddleware().use(request as unknown as Request, response as unknown as Response, next as NextFunction);
    expect(next).toHaveBeenCalledOnce();
    expect(response.setHeader).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
    response.emit('finish');
    const record = JSON.parse(String(write.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(record).toMatchObject({ event: 'http.request', method: 'GET', status: 200 });
    expect(JSON.stringify(record)).not.toContain('secret-fixture');
  } finally {
    write.mockRestore();
  }
});
