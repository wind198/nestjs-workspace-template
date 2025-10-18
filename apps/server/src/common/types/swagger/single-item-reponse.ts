import { ApiProperty } from '@nestjs/swagger';
import { ISingleItemData } from '@app/server/common/types/single-item-data';
import { Type } from '@nestjs/common';

class SingleItemResponse<T> implements ISingleItemData<T> {
  @ApiProperty({ description: 'Data field contain single item data' })
  data: T;
}

export function createSingleItemResponseDto<T>(
  ItemDto: Type<T>,
): Type<SingleItemResponse<T>> {
  const className = `SingleItemResponse_${ItemDto.name}`;

  class SingleItemResponseDto implements SingleItemResponse<T> {
    @ApiProperty({ type: () => ItemDto })
    data: T;
  }

  // Dynamically assign a name for better debugging (not recognized by TS)
  Object.defineProperty(SingleItemResponseDto, 'name', { value: className });

  return SingleItemResponseDto;
}
