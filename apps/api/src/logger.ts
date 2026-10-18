import { LoggerService } from '@nestjs/common';

export class JsonLogger implements LoggerService {
  private write(level: string, message: unknown, context?: string) {
    process.stdout.write(JSON.stringify({ level, message: String(message), context, time: new Date().toISOString() }) + '\n');
  }
  log(message: unknown, context?: string) { this.write('info', message, context); }
  warn(message: unknown, context?: string) { this.write('warn', message, context); }
  error(message: unknown, _stack?: string, context?: string) { this.write('error', message, context); }
}
