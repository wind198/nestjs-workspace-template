import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiResponse({ type: String, description: 'Greeting message' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
