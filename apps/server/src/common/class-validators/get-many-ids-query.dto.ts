import { PopulateCountArrayQuery } from '@app/server/common/class-validators/populate-count-array-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsUUID } from 'class-validator';

export class GetManyIdsQuery extends PopulateCountArrayQuery {
  @ApiProperty({ type: () => [String], isArray: true })
  @IsArray()
  @IsUUID('all', { each: true })
  @Transform(({ value }) => {
    const output = (value as string)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return output;
  })
  ids: string[];
}
