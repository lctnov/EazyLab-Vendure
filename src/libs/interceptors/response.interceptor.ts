// src/libs/interceptors/response.interceptor.ts
import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	ArgumentsHost,
	ExceptionFilter,
	Catch,
	HttpException,
	Logger,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { map, catchError } from 'rxjs/operators';
  
  @Injectable()
  @Catch()
  export class ResponseInterceptor
	implements NestInterceptor, ExceptionFilter
  {
	private readonly logger = new Logger(ResponseInterceptor.name);
  
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
	  return next.handle().pipe(
		map((data) => {
		  const transformed = this.transformBigInt(data);
		  this.logger.debug('Success payload:', transformed);
  
		  if (data && typeof data === 'object' && 'status' in data) {
			return {
			  iPayload: data.status ? this.transformBigInt(data.payload) : [],
			  iStatus: data.status,
			  iMessage: data.message || 'Success',
			};
		  }
  
		  return {
			iPayload: transformed,
			iStatus: true,
			iMessage: 'Success',
		  };
		}),
		catchError((err) => {
		  this.logger.error('Error in interceptor:', err);
		  return throwError(() => err);
		}),
	  );
	}
  
	catch(exception: unknown, host: ArgumentsHost) {
	  const ctx = host.switchToHttp();
	  const res = ctx.getResponse();
  
	  let message = 'Internal server error';
	  let statusCode = 500;
  
	  if (exception instanceof HttpException) {
		const response: any = exception.getResponse();
		statusCode = exception.getStatus();
		message = typeof response === 'string' ? response : response?.message || message;
	  } else if (exception instanceof Error) {
		message = exception.message;
		if (message.includes('BigInt')) {
		  message = 'Server error: Invalid data format';
		}
	  }
  
	  this.logger.error(`API Error: ${message}`, exception instanceof Error ? exception.stack : '');
  
	  res.status(200).json({
		iPayload: null,
		iStatus: false,
		iMessage: message,
	  });
	}
  
	private transformBigInt(value: any): any {
	  if (value === null || value === undefined) return value;
	  if (typeof value === 'bigint') return value.toString();
	  if (Array.isArray(value)) return value.map(v => this.transformBigInt(v));
	  if (typeof value === 'object') {
		const obj: any = {};
		for (const key in value) {
		  obj[key] = this.transformBigInt(value[key]);
		}
		return obj;
	  }
	  return value;
	}
  }