import { GetListQuery } from '@app/server/common/class-validators/get-list-query.dto';
import { GetManyIdsQuery } from '@app/server/common/class-validators/get-many-ids-query.dto';
import { GetOneIdQuery } from '@app/server/common/class-validators/get-one-id-query.dto';
import {
  parseCountToPrismaSelect,
  parsePopulateToPrismaInclude,
} from '@app/server/common/helpers/parsers';
import { WithLogger } from '@app/server/common/providers/WithLogger';
import { IMultiItemsData } from '@app/server/common/types/multi-items-data';
import { INumberOrString } from '@app/server/common/types/number-or-string';
import { IPaginatedData } from '@app/server/common/types/paginated-data';
import { ISingleItemData } from '@app/server/common/types/single-item-data';
import { isEmpty } from 'lodash';
import { WinstonLogger } from 'nest-winston';

/**
 * Abstract base controller providing standardized CRUD operations for RESTful APIs.
 * Implements common patterns for data retrieval, creation, updating, and deletion
 * with built-in logging, field authorization, and Prisma query building.
 *
 * @template T - Entity/model type managed by this controller
 * @template CreateDto - DTO for resource creation
 * @template UpdateDto - DTO for resource updates
 */
export abstract class ResourceController<
  T,
  CreateDto,
  UpdateDto,
> extends WithLogger {
  constructor(winstonLogger: WinstonLogger) {
    super(winstonLogger);
  }

  /** Retrieves a paginated list of resources with filtering, sorting, and pagination. */
  abstract getList(query: GetListQuery): Promise<IPaginatedData<T>>;

  /** Retrieves a single resource by ID with optional population and counting. */
  abstract getById(
    id: INumberOrString,
    query: GetOneIdQuery,
  ): Promise<ISingleItemData<T>>;

  /** Retrieves multiple resources by their IDs with optional population and counting. */
  abstract getManyByIds(
    ids: INumberOrString[],
    query: GetManyIdsQuery,
  ): Promise<IMultiItemsData<T>>;

  /** Creates a new resource with validation and business rule enforcement. */
  abstract create(
    data: CreateDto,
    query: GetOneIdQuery,
  ): Promise<ISingleItemData<T>>;

  /** Updates an existing resource with validation and authorization checks. */
  abstract update(
    id: INumberOrString,
    data: UpdateDto,
    query: GetOneIdQuery,
  ): Promise<ISingleItemData<T>>;

  /** Deletes a resource with authorization checks and cleanup operations. */
  abstract delete(
    id: INumberOrString,
    query: GetOneIdQuery,
  ): Promise<ISingleItemData<T>>;

  /**
   * Field-level authorization for inclusion operations. Override to implement
   * custom authorization logic for specific fields.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canInclude(_include: string): boolean {
    return false;
  }

  /**
   * Field-level authorization for counting operations. Override to implement
   * custom authorization logic for specific fields.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canCount(_count: string): boolean {
    return false;
  }

  /**
   * Builds Prisma include object from populate/count parameters with authorization filtering.
   * Automatically filters fields through canInclude/canCount methods and converts
   * to Prisma-compatible include/select objects.
   */
  buildPrismaInclude(
    populate: string[],
    count: string[],
  ): Record<string, any> | undefined {
    const output = {
      ...(parsePopulateToPrismaInclude(
        Array.isArray(populate)
          ? populate.filter((include) => this.canInclude(include))
          : [],
      ) ?? {}),
      ...(parseCountToPrismaSelect(
        Array.isArray(count)
          ? count.filter((count) => this.canCount(count))
          : [],
      ) ?? {}),
    };
    if (isEmpty(output)) {
      return undefined;
    }
    return output;
  }
}
