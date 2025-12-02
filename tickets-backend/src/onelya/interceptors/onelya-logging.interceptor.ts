import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class OnelyaLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OnelyaLoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, body } = request;
    const startedAt = Date.now();

    this.logger.log(`[${method}] ${originalUrl}`);
    if (body && Object.keys(body).length > 0) {
      this.logger.debug(
        `[${method}] ${originalUrl} payload: ${JSON.stringify(body)}`,
      );
    }

    return next.handle().pipe(
      tap({
        next: (responseBody) =>
          this.logger.log(
            `[${method}] ${originalUrl} completed in ${
              Date.now() - startedAt
            }ms (${this.safeSize(responseBody)})`,
          ),
        error: (err) =>
          this.logger.error(
            `[${method}] ${originalUrl} failed in ${
              Date.now() - startedAt
            }ms: ${err?.message ?? err}`,
          ),
      }),
    );
  }

  private safeSize(res: unknown): string {
    if (!res) {
      return 'empty';
    }
    const raw =
      typeof res === 'string' ? res : JSON.stringify(res).substring(0, 200);
    return `${raw.length}b`;
  }
}

