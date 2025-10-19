import { NotFoundException } from '@nestjs/common';

export const throwNotFound = (message: string) => {
  throw new NotFoundException(message);
};
