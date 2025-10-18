import { Module } from '@nestjs/common';
import * as path from 'path';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule as I18nModuleNest,
  I18nOptions,
  I18nResolver,
  I18nYamlLoader,
  QueryResolver,
} from 'nestjs-i18n';

declare module 'express' {
  interface Request {
    i18nLang: string;
  }
}

export const i18nOptions: I18nOptions = {
  fallbackLanguage: 'en',
  fallbacks: {
    'en-US': 'en',
    'en-GB': 'en',
    'en-AU': 'en',
    'en-CA': 'en',
    'en-NZ': 'en',
    'en-ZA': 'en',
    'en-IN': 'en',
    'en-IE': 'en',
  },
  loaderOptions: {
    path: path.resolve(process.cwd(), 'lang'),
    // load yaml files
    watch: true,
  },
  loader: I18nYamlLoader,
};

export const i18nResolver = [
  { use: QueryResolver, options: ['lang'] },
  AcceptLanguageResolver,
  new HeaderResolver(['x-lang']),
] as I18nResolver[];

@Module({
  imports: [
    I18nModuleNest.forRoot({
      ...i18nOptions,
      resolvers: i18nResolver,
    }),
  ],
  controllers: [],
})
export class I18nModule {}
