import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
  
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const payload = this.transformBigInt(data);

        // 1. Nếu là object có status (từ service)
        if (data && typeof data === 'object' && 'status' in data) {
          return {
            iPayload: this.transformBigInt(data.payload ?? data),
            iStatus: data.status,
            iMessage: data.message || (data.status ? 'Success' : 'Fail'),
          };
        }

        // 2. Nếu là mảng (report, list)
        if (Array.isArray(payload)) {
          return {
            iPayload: payload,
            iStatus: true,
            iMessage: payload.length > 0 ? 'Success' : 'No data found',
          };
        }

        // 3. Nếu là object thường
        if (payload && typeof payload === 'object') {
          return {
            iPayload: payload,
            iStatus: true,
            iMessage: 'Success',
          };
        }

        // 4. Primitive hoặc null
        return {
          iPayload: payload,
          iStatus: true,
          iMessage: 'Success',
        };
      }),
      catchError((err) => {
        this.logger.error('Interceptor caught error:', err);
        return throwError(() => err);
      }),
    );
  }

  // XỬ LÝ LỖI RIÊNG QUA ExceptionFilter
  private transformBigInt(value: any): any {
	if (value === null || value === undefined) return value;
	if (typeof value === 'bigint') return value.toString();
	if (value instanceof Prisma.Decimal) return Number(value.toFixed(2)); // ← SỬA
	if (Array.isArray(value)) return value.map(v => this.transformBigInt(v));
	if (typeof value === 'object') {
	  return Object.fromEntries(
		Object.entries(value).map(([k, v]) => [k, this.transformBigInt(v)])
	  );
	}
	return value;
  }
}