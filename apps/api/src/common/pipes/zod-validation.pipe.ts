import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error: any) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: error.errors || error.message,
      });
    }
  }
}
