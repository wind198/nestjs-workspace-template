import { ApiProperty } from '@nestjs/swagger';
import { IPaginatedData } from '@app/server/common/types/paginated-data';
import { IPagination } from '@app/server/common/types/pagination';
import { Type } from '@nestjs/common';

class PaginatedResponsePagination implements IPagination {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  total: number;
}
class PaginatedResponse<T> implements IPaginatedData<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty()
  pagination: PaginatedResponsePagination;
}

export function createPaginatedResponseDto<T>(
  ItemDto: Type<T>,
): Type<PaginatedResponse<T>> {
  const className = `PaginatedResponse_${ItemDto.name}`;

  class PaginatedResponseDto implements PaginatedResponse<T> {
    @ApiProperty({ type: () => ItemDto, isArray: true })
    data: T[];

    @ApiProperty({ type: () => PaginatedResponsePagination })
    pagination: PaginatedResponsePagination;
  }

  Object.defineProperty(PaginatedResponseDto, 'name', { value: className });

  return PaginatedResponseDto;
}
