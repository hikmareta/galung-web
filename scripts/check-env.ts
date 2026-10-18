import { parseConfig } from '../packages/config/src/index';
try {
  const parsed = parseConfig(process.env);
  console.log(`Configuration valid for ${parsed.APP_ENV}`);
} catch (error) {
  console.error('Configuration invalid:', error instanceof Error ? error.message : 'unknown error');
  process.exitCode = 1;
}
