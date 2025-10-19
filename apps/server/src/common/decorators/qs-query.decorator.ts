import { createParamDecorator, ExecutionContext, Type } from '@nestjs/common';
import { parse } from 'qs';
import { Request } from 'express';
import { parseObject } from 'query-types';
import { ValidationPipe } from '@nestjs/common';

// Only use this decorator if you need to parse the query string manually, otherwise use the built-in @Query decorator
// Currently, it's only used to parsed the query string for get list API
export function QsQuery<T extends Type<any>>(type: T): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const factory = createParamDecorator(
      async (_data: unknown, ctx: ExecutionContext) => {
        const request: Request = ctx.switchToHttp().getRequest();
        const queryString = request.originalUrl.split('?')[1] || '';
        const raw = parseObject(parse(queryString));

        // Apply validation pipe manually
        const validationPipe = new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidUnknownValues: true,
        });

        // Validate against the given class
        const result = await validationPipe.transform(raw, {
          type: 'query',
          metatype: type,
        });

        return result;
      },
    );

    // Register the actual decorator
    return factory()(target, propertyKey, parameterIndex);
  };
}
