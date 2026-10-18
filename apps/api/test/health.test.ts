import { expect, test } from 'vitest';
import { HealthController } from '../src/health';
test('liveness is deterministic', () => expect(new HealthController().live()).toEqual({ status: 'ok' }));
