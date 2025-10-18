import { createParamDecorator, ExecutionContext, Type } from '@nestjs/common';
import { parse } from 'qs';
import { Request } from 'express';
import { parseObject } from 'query-types';
import { ValidationPipe } from '@nestjs/common';

export function QsQuery<T extends Type<any>>(type: T): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const factory = createParamDecorator(
      async (_data: unknown, ctx: ExecutionContext) => {
        const request: Request = ctx.switchToHttp().getRequest();
        const queryString = request.originalUrl.split('?')[1] || '';
        const raw = parseObject(parse(queryString));

        // Apply validation pipe manually
        const pipe = new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidUnknownValues: true,
        });

        // Validate against the given class
        return pipe.transform(raw, {
          type: 'query',
          metatype: type,
        });
      },
    );

    // Register the actual decorator
    return factory()(target, propertyKey, parameterIndex);
  };
}
