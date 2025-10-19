import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResourceController } from '@app/server/common/controllers/resource.controller';
import { UserResponse } from '@app/server/api/users/dto/user.response';
import { CreateUserDto } from '@app/server/api/users/dto/create-user.dto';
import { UpdateUserDto } from '@app/server/api/users/dto/update-user.dto';
import { GetListQuery } from '@app/server/common/class-validators/get-list-query.dto';
import { GetOneIdQuery } from '@app/server/common/class-validators/get-one-id-query.dto';
import { IPaginatedData } from '@app/server/common/types/paginated-data';
import { ISingleItemData } from '@app/server/common/types/single-item-data';
import { QsQuery } from '@app/server/common/decorators/qs-query.decorator';
import { createSingleItemResponseDto } from '@app/server/common/types/swagger/single-item-reponse';
import { createPaginatedResponseDto } from '@app/server/common/types/swagger/paginated-response';
import { Prisma } from 'generated/prisma';
import {
  parseQsQueryToPrismaWhere,
  parseSkipLimitFromPagination,
  parseSortToPrismaOrderBy,
} from '@app/server/common/helpers/parsers';
import { throwNotFound } from '@app/server/common/helpers/exceptions';
import { I18nService } from 'nestjs-i18n';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { GetManyIdsQuery } from '@app/server/common/class-validators/get-many-ids-query.dto';
import { IMultiItemsData } from '@app/server/common/types/multi-items-data';
import { createMultiItemsResponseDto } from '@app/server/common/types/swagger/multi-items-response';
@ApiTags('Users')
@Controller('users')
export class UsersController
  extends ResourceController<UserResponse, CreateUserDto, UpdateUserDto>
  implements OnModuleInit
{
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger,
  ) {
    super(winstonLogger);
  }

  onModuleInit() {
    this.logger.log(
      'UsersController initialized',
      { foo: 'bar' },
      { bar: 'baz' },
    );
  }

  canInclude(include: string): boolean {
    return ['UserSession'].includes(include);
  }

  canCount(count: string): boolean {
    return ['UserSession'].includes(count);
  }

  @ApiResponse({ type: createPaginatedResponseDto(UserResponse) })
  @Get()
  async getList(
    @QsQuery(GetListQuery)
    query: GetListQuery,
  ): Promise<IPaginatedData<UserResponse>> {
    const filters: Prisma.UserWhereInput | undefined =
      parseQsQueryToPrismaWhere(query.filters);
    const include = this.buildPrismaInclude(
      query.populate || [],
      query.count || [],
    );
    const data = await this.usersService.userPrismaClient.findMany({
      where: filters,
      orderBy: parseSortToPrismaOrderBy(query.sort),
      include,
      ...parseSkipLimitFromPagination(query.pagination),
    });
    const total = await this.usersService.userPrismaClient.count({
      where: filters,
    });
    return {
      data: data,
      pagination: {
        total,
        page: query.pagination.page,
        pageSize: query.pagination.pageSize,
      },
    };
  }

  @ApiResponse({ type: createMultiItemsResponseDto(UserResponse) })
  @Get('many')
  async getManyByIds(
    @Body() ids: number[],
    @QsQuery(GetManyIdsQuery) query: GetManyIdsQuery,
  ): Promise<IMultiItemsData<UserResponse>> {
    const include = this.buildPrismaInclude(
      query.populate || [],
      query.count || [],
    );
    const data = await this.usersService.userPrismaClient.findMany({
      where: { id: { in: ids } },
      include,
    });
    return { data: data };
  }

  @ApiResponse({ type: createSingleItemResponseDto(UserResponse) })
  @Get(':id')
  async getById(
    @Param('id', new ParseIntPipe()) id: number,
    @QsQuery(GetOneIdQuery) query: GetOneIdQuery,
  ): Promise<ISingleItemData<UserResponse>> {
    const include = this.buildPrismaInclude(
      query.populate || [],
      query.count || [],
    );
    const data = await this.usersService.userPrismaClient.findUnique({
      where: { id },
      include,
    });
    if (!data) {
      throwNotFound(
        this.i18n.t('common.errors.notFound', {
          args: { element: this.i18n.t('resource.user') },
        }),
      );
    }
    return {
      data: data as UserResponse,
    };
  }

  @ApiResponse({ type: createSingleItemResponseDto(UserResponse) })
  @Post()
  async create(
    @Body() data: CreateUserDto,
    @QsQuery(GetOneIdQuery) query: GetOneIdQuery,
  ): Promise<ISingleItemData<UserResponse>> {
    const include = this.buildPrismaInclude(
      query.populate || [],
      query.count || [],
    );
    const user = await this.usersService.createUser(data, include);
    return {
      data: user,
    };
  }

  @ApiResponse({ type: createSingleItemResponseDto(UserResponse) })
  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: UpdateUserDto,
    @QsQuery(GetOneIdQuery) query: GetOneIdQuery,
  ): Promise<ISingleItemData<UserResponse>> {
    const include = this.buildPrismaInclude(
      query.populate || [],
      query.count || [],
    );
    await this.usersService.checkUserById(id);
    const updatedUser = await this.usersService.userPrismaClient.update({
      where: { id },
      data,
      include,
    });
    return {
      data: updatedUser,
    };
  }

  @ApiResponse({ type: createSingleItemResponseDto(UserResponse) })
  @Delete(':id')
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
    @QsQuery(GetOneIdQuery) query: GetOneIdQuery,
  ): Promise<ISingleItemData<UserResponse>> {
    await this.usersService.checkUserById(id);
    const include = this.buildPrismaInclude(
      query.populate || [],
      query.count || [],
    );

    const result = await this.usersService.userPrismaClient.delete({
      where: { id },
      include,
    });
    return {
      data: result,
    };
  }
}
