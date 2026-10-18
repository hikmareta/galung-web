import { LoggerService } from '@nestjs/common';

export class JsonLogger implements LoggerService {
  private write(level: string) {
    // Nest can pass exception messages or request data here. Emit only safe fields.
    process.stdout.write(JSON.stringify({ level, event: 'framework.message', time: new Date().toISOString() }) + '\n');
  }
  log(message: unknown, context?: string) { void message; void context; this.write('info'); }
  warn(message: unknown, context?: string) { void message; void context; this.write('warn'); }
  error(message: unknown, stack?: string, context?: string) { void message; void stack; void context; this.write('error'); }
}
