import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	ArgumentsHost,
	ExceptionFilter,
	Catch,
	HttpException,
	HttpStatus,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { map, catchError } from 'rxjs/operators';
  
  @Injectable()
  @Catch()
  export class ResponseInterceptor
	implements NestInterceptor, ExceptionFilter
  {
	// Xử lý khi response thành công
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
	  return next.handle().pipe(
		map((data) => {
		// console.log('data', data);
		return	{
		  iPayload: data.status ? data?.payload : [],
		  iStatus: data.status,
		  iMessage: data.message,
		}}),
		catchError((err) => throwError(() => err)) // để error chuyển sang catch()
	  );
	}
  
	// Xử lý khi có exception
	catch(exception: unknown, host: ArgumentsHost) {
	  const ctx = host.switchToHttp();
	  const res = ctx.getResponse();
  
	  let message = 'Internal server error';
  
	  if (exception instanceof HttpException) {
		const response: any = exception.getResponse();
		message =
		  typeof response === 'string'
			? response
			: response?.message || message;
	  } else if (exception instanceof Error) {
		message = exception.message;
	  }
  
	  res.status(200).json({
		iPayload: null,
		iStatus: false,
		iMessage: message,
	  });
	}
  }
  