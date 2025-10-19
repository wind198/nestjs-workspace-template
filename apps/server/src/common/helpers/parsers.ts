import { GetListQuery } from '@app/server/common/class-validators/get-list-query.dto';
import { DEFAULT_PAGE_SIZE } from '@app/server/common/constants/rules';
import { checkShouldAddDeletedAtForRelation } from '@app/server/common/helpers/prisma';
import { IPagination } from '@app/server/common/types/pagination';
import { ISort } from '@app/server/common/types/sort';
import { isEmpty, set } from 'lodash';

/**
 * Parse the sort to the prisma order by
 * @param sort - Sort to parse
 * @returns The prisma order by
 */
export const parseSortToPrismaOrderBy = (sort: ISort[]) => {
  if (!sort?.length) return { createdAt: 'desc' as const };
  return sort.reduce(
    (acc, item) => {
      acc[item.field] = item.sort;
      return acc;
    },
    {} as Record<string, 'asc' | 'desc'>,
  );
};

/**
 * Parse the populate to the prisma include
 * @param populate - Relations to parse (can be nested), example: ['user','user.profile', 'user.address']
 * @returns The prisma include
 */
export const parsePopulateToPrismaInclude = (
  populate: string[],
): Record<string, any> | undefined => {
  if (!populate?.length) return;
  const getInclude = (item: string): object => {
    const firstDot = item.indexOf('.');
    if (firstDot === -1) {
      if (checkShouldAddDeletedAtForRelation(item, {})) {
        return { [item]: { where: { deletedAt: null } } };
      }
      return { [item]: true };
    }
    const key = item.slice(0, firstDot);
    const field = item.slice(firstDot + 1);
    const output = {
      [key]: { include: getInclude(field) },
    };
    if (checkShouldAddDeletedAtForRelation(key, {})) {
      set(output, `${key}.where.deletedAt`, null);
    }
    return output;
  };

  const output = (populate ?? []).map((key) => {
    const output = getInclude(key);
    return output;
  });

  return Object.assign({}, ...output);
};

/**
 * Parse the count to the prisma select
 * @param count - relations to count, example: ['user','post']
 * @returns The prisma select
 */
export const parseCountToPrismaSelect = (
  count: string[],
): Record<string, any> | undefined => {
  if (!count?.length) return;

  const countSelect = count.reduce(
    (acc, item) => {
      acc[item] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  if (isEmpty(countSelect)) {
    return {};
  }

  return {
    _count: {
      select: countSelect,
    },
  };
};

/**
 * Parse the pagination to the skip and take
 * @param pagination - Pagination to parse, example: { page: 1, pageSize: 10 }
 * @returns The skip and take, fallback to default page size if not provided
 */
export const parseSkipLimitFromPagination = (pagination: IPagination) => {
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE;
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};

/**
 * Parse the expiration time of @nestjs/jwt format
 * @param expirationTime - Expiration time to parse, example: '1h', '1d', '1w'
 * @returns The value and unit
 */
export const parseExpirationTime = (expirationTime: string) => {
  const value = parseInt(expirationTime);
  const unit = expirationTime.charAt(expirationTime.length - 1);
  if (!value || !unit) {
    throw new Error('Invalid expiration time');
  }
  return { value, unit };
};

/**
 * Parse the filters object sent by frontend to the prisma where
 * @param filters - Filters to parse
 * @returns The prisma where
 */
export const parseQsQueryToPrismaWhere = (
  filters: GetListQuery['filters'],
): Record<string, any> | undefined => {
  if (isEmpty(filters)) return;
  const isPrimitive = (value: any): boolean => {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  };

  const mapObject = (input: Record<string, any>) => {
    const output = {};
    for (const [key, value] of Object.entries(input)) {
      if (value === null) {
        output[key] = null;
      } else if (!value) {
        continue;
      } else if (
        key === 'q' &&
        (typeof value === 'string' || typeof value === 'number')
      ) {
        output[key] = {
          contains: value.toString(),
          mode: 'insensitive',
        };
      } else if (isPrimitive(value)) {
        output[key] = value;
      } else if (isEmpty(value)) {
        continue;
      } else if (Array.isArray(value)) {
        output[key] = value.map((item) =>
          isPrimitive(item) || item === null || item === undefined
            ? item
            : mapObject(item),
        );
      } else {
        output[key] = mapObject(value);
      }
    }
    return output;
  };

  return mapObject(filters);
};
