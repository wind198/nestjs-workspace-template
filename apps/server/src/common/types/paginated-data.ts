import { IPagination } from '@app/server/common/types/pagination';

export type IPaginatedData<T> = {
  data: T[];
  pagination: IPagination & { total: number };
};
