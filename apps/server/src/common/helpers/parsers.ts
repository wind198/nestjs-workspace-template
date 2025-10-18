import { DEFAULT_PAGE_SIZE } from '@app/server/common/constants/rules';
import { checkShouldAddDeletedAtForRelation } from '@app/server/common/helpers/prisma';
import { IPagination } from '@app/server/common/types/pagination';
import { ISort } from '@app/server/common/types/sort';
import { get, isEmpty, set } from 'lodash';

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

export const parsePopulateToPrismaInclude = (
  populate: string[],
  count: string[] = [],
) => {
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
  let output = (populate ?? []).map((key) => {
    const output = getInclude(key);
    return output;
  });
  output = Object.assign({}, ...output);
  output = Object.assign(output, {
    _count: {
      select: count.reduce(
        (acc, item) => {
          acc[item] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    },
  });
  if (isEmpty(get(output, '_count.select'))) {
    delete (output as any)._count;
  }
  return output as any;
};

export const parseSkipLimitFromPagination = (pagination: IPagination) => {
  const page = pagination.page ?? 1;
  const pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE;
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};
export const parseToJsonIfString = (value: string | object): object => {
  try {
    if (typeof value === 'string' && value.trim() !== '') {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error(error);
    return {};
  }
  return value as object;
};

export const parseExpirationTime = (expirationTime: string) => {
  const value = parseInt(expirationTime);
  const unit = expirationTime.charAt(expirationTime.length - 1);
  if (!value || !unit) {
    throw new Error('Invalid expiration time');
  }
  return { value, unit };
};
