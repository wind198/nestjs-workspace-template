import { IS_PUBLIC } from '@app/server/common/constants/keys';
import { SetMetadata } from '@nestjs/common';
export const IsPublic = () => SetMetadata(IS_PUBLIC, true);
