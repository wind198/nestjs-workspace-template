import { Controller } from '@nestjs/common';
import { UserSessionsService } from './user-sessions.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User Sessions')
@Controller('user-sessions')
export class UserSessionsController {
  constructor(private readonly userSessionsService: UserSessionsService) {}
}
