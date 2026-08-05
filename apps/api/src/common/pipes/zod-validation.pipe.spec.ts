import { describe, it, expect } from 'vitest';
import { ZodValidationPipe } from './zod-validation.pipe';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    name: z.string().min(3),
    age: z.number().min(18),
  });

  const pipe = new ZodValidationPipe(schema);

  it('should parse and return valid values', () => {
    const input = { name: 'PGS Hub', age: 25 };
    expect(pipe.transform(input, {} as any)).toEqual(input);
  });

  it('should throw BadRequestException on invalid input', () => {
    const input = { name: 'PG', age: 15 };
    expect(() => pipe.transform(input, {} as any)).toThrow(BadRequestException);
  });
});
