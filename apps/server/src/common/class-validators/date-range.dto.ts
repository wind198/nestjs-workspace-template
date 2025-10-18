import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class DateRangeDto {
  @ApiProperty()
  @IsDate()
  @Expose()
  @Type(() => Date)
  dateFrom: Date;

  @ApiProperty()
  @IsDate()
  @Expose()
  @Type(() => Date)
  dateTo: Date;
}
