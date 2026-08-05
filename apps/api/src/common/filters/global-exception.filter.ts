import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { FastifyReply, FastifyRequest } from 'fastify';

interface CustomRequest extends FastifyRequest {
  requestId?: string;
  headers: Record<string, string | undefined>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('[Exception Caught]', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<CustomRequest>();

    // Resolve or generate Request ID
    const requestId = request.requestId || request.headers?.['x-request-id'] || uuidv4();

    // Set Response Header
    response.header('x-request-id', requestId);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Đã xảy ra lỗi hệ thống';
    let details: unknown[] = [];

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
      const resBody = exception.getResponse();

      if (typeof resBody === 'object' && resBody !== null) {
        const body = resBody as Record<string, unknown>;
        // If NestJS default validation error (e.g. ValidationPipe)
        if (body.message && Array.isArray(body.message)) {
          code = 'VALIDATION_ERROR';
          message = 'Dữ liệu đầu vào không hợp lệ';
          details = body.message;
        } else {
          // If custom exception payload
          code = (body.code as string) || (body.message as string) || exception.name || 'ERROR';
          message = (body.message as string) || exception.message || 'Yêu cầu không hợp lệ';
          details = (body.details as unknown[]) || [];
        }
      } else {
        code = exception.message || exception.name || 'ERROR';
        message = exception.message || 'Yêu cầu không hợp lệ';
      }
    } else if (exception && typeof exception === 'object') {
      const errObj = exception as Record<string, unknown>;
      // Map other custom exceptions or database constraint errors safely
      code = (errObj.code as string) || 'INTERNAL_ERROR';
      message = (errObj.message as string) || 'Đã xảy ra lỗi hệ thống';
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

    response.status(status).send(errorResponse);
  }
}
