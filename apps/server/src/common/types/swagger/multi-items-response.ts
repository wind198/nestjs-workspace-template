import { IMultiItemsData } from '@app/server/common/types/multi-items-data';
import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

class MultiItemsResponse<T> implements IMultiItemsData<T> {
  @ApiProperty({
    description: 'Data field contain an array of items',
    isArray: true,
  })
  data: T[];
}

export function createMultiItemsResponseDto<T>(
  ItemDto: Type<T>,
): Type<MultiItemsResponse<T>> {
  const className = `MultiItemsResponse_${ItemDto.name}`;

  class MultiItemsResponseDto implements MultiItemsResponse<T> {
    @ApiProperty({ type: () => [ItemDto], isArray: true })
    data: T[];
  }

  Object.defineProperty(MultiItemsResponseDto, 'name', { value: className });

  return MultiItemsResponseDto;
}
