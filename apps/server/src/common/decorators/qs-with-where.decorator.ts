import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GetListQuery } from '@app/server/common/class-validators/get-list-query.dto';
import { parseQsQueryToPrismaWhere } from '@app/server/common/helpers/parsers';

/**
 * Decorator that automatically converts QsQuery filters to Prisma where clause
 * Usage: @QsWithWhere() query: GetListQuery & { where?: any }
 */
export const QsWithWhere = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query as GetListQuery;

    if (!query || typeof query !== 'object') {
      return query;
    }

    // Parse filters to Prisma where clause
    const where = parseQsQueryToPrismaWhere(query.filters);

    // Return the query with the parsed where clause
    return {
      ...query,
      where,
    };
  },
);
