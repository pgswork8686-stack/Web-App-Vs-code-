import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();

    // Resolve or generate Request ID
    const requestId = request.requestId || request.headers?.['x-request-id'] || uuidv4();

    // Set Response Header
    if (response.header) {
      response.header('x-request-id', requestId);
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Đã xảy ra lỗi hệ thống';
    let details: any[] = [];

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      message = 'Dữ liệu đầu vào không hợp lệ';
      details = exception.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resBody: any = exception.getResponse();

      if (typeof resBody === 'object' && resBody !== null) {
        // If NestJS default validation error (e.g. ValidationPipe)
        if (resBody.message && Array.isArray(resBody.message)) {
          code = 'VALIDATION_ERROR';
          message = 'Dữ liệu đầu vào không hợp lệ';
          details = resBody.message;
        } else {
          // If custom exception payload
          code = resBody.code || resBody.message || exception.name || 'ERROR';
          message = resBody.message || exception.message || 'Yêu cầu không hợp lệ';
          details = resBody.details || [];
        }
      } else {
        code = exception.message || exception.name || 'ERROR';
        message = exception.message || 'Yêu cầu không hợp lệ';
      }
    } else if (exception && typeof exception === 'object') {
      // Map other custom exceptions or database constraint errors safely
      code = exception.code || 'INTERNAL_ERROR';
      message = exception.message || 'Đã xảy ra lỗi hệ thống';
    }

    // Standard Error Response Contract
    const errorResponse = {
      data: null,
      meta: {
        requestId,
      },
      error: {
        code,
        message,
        details,
      },
    };

    // Ensure we do not send raw SQL errors or internal secrets in production
    if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.error.message = 'Đã xảy ra lỗi hệ thống';
    }

    // Fastify send response
    if (response.status) {
      response.status(status).send(errorResponse);
    } else {
      // Express fallback if any
      response.status(status).json(errorResponse);
    }
  }
}
