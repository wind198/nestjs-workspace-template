import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-amazon';

@Injectable()
export class AmazonStrategy extends PassportStrategy(Strategy, 'amazon') {
  constructor() {
    super({
      clientID: process.env.AMAZON_CLIENT_ID,
      clientSecret: process.env.AMAZON_CLIENT_SECRET,
      callbackURL: process.env.AMAZON_CALLBACK_URL,
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any): any {
    const { id, displayName, emails } = profile;

    const user = {
      amazonId: id,
      name: displayName,
      email: emails?.[0]?.value,
    };

    return user;
  }
}
