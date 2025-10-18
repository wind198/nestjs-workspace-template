import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthService } from '@app/server/api/auth/auth.service';
import { WithLogger } from '@app/server/common/providers/WithLogger';

declare module 'express' {
  interface Request {
    shouldRefreshToken: boolean;
  }
}

@Injectable()
export class RefreshTokenInterceptor
  extends WithLogger
  implements NestInterceptor
{
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {
    super();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req: Request = ctx.getRequest<Request>();
    const res: Response = ctx.getResponse<Response>();

    return next.handle().pipe(
      mergeMap(async (data) => {
        if (res.statusCode !== 200) {
          return data;
        }
        if (req.shouldRefreshToken) {
          const userPayload = req.user;
          try {
            const newAccessToken =
              await this.authService.generateAccessToken(userPayload);

            this.authService.attachAccessTokenToCookie(res, newAccessToken);
          } catch (error) {
            this.logger.error('Error in refresh token', error);
          }
        }
        return data;
      }),
    );
  }
}
