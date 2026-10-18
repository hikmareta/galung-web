import { expect, test, vi } from 'vitest';
import { JsonLogger } from '../src/logger';

test('framework logger does not emit arbitrary error content or credentials', () => {
  const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  try {
    new JsonLogger().error('password=secret-fixture', 'token=secret-fixture', 'secret-fixture');
    expect(write).toHaveBeenCalledOnce();
    const record = JSON.parse(String(write.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(record).toMatchObject({ level: 'error', event: 'framework.message' });
    expect(JSON.stringify(record)).not.toContain('secret-fixture');
  } finally {
    write.mockRestore();
  }
});
