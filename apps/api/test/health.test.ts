import { expect, test } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController, ReadinessProbe } from '../src/health';

test('liveness is deterministic', () => expect(new HealthController({ check: async () => {} } as ReadinessProbe).live()).toEqual({ status: 'ok' }));
test('readiness succeeds after dependencies respond', async () => {
  const controller = new HealthController({ check: async () => {} } as ReadinessProbe);
  await expect(controller.ready()).resolves.toEqual({ status: 'ok' });
});
test('readiness hides dependency errors behind a stable 503 envelope', async () => {
  const controller = new HealthController({ check: async () => { throw new Error('secret-db-password'); } } as ReadinessProbe);
  await expect(controller.ready()).rejects.toMatchObject({
    status: 503,
    response: { error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'Service not ready' } },
  } satisfies Partial<ServiceUnavailableException>);
});
