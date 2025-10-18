import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { upperFirst } from 'lodash';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class GeneralFilter implements ExceptionFilter {
  constructor(private i18nService: I18nService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();
    const currentLang = request.i18nLang;
    const status = exception.getStatus();
    const error = exception.getResponse();

    let errorMessage: string =
      typeof error === 'string'
        ? error
        : (error as { message: string }).message;
    if (currentLang === 'en') {
      errorMessage = upperFirst(errorMessage);
    }

    response.status(status).json({
      statusCode: status,
      message: errorMessage,
    });
  }
}
