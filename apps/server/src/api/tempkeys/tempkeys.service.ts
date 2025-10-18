import { Prisma } from 'generated/prisma';
import { DefaultArgs } from 'generated/prisma/runtime/library';
import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TempKeysService {
  tempKeyPrismaClient: Prisma.TempKeyDelegate<DefaultArgs>;

  constructor(private readonly prisma: PrismaService) {
    this.tempKeyPrismaClient = this.prisma.tempKey;
  }

  checkTempKeyByKey(id: string) {
    return this.tempKeyPrismaClient.findUnique({
      where: { id },
    });
  }
}
