import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';
import { HealthController } from '../src/health';

const spec = readFileSync(resolve('openapi/operational.yaml'), 'utf8');

test('operational OpenAPI paths match the registered health handlers', () => {
  for (const method of ['live', 'ready'] as const) {
    const route = Reflect.getMetadata('path', HealthController.prototype[method]) as string;
    expect(route).toBe(`health/${method}`);
    expect(spec).toContain(`  /${route}:\n    get:`);
  }
  expect(spec).toContain("'503':");
  expect(spec).toContain('const: DEPENDENCY_UNAVAILABLE');
});
