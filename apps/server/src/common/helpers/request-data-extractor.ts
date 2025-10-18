import { Request } from 'express';

export const extractLangFromRequest = (request: Request) => {
  const lang = request.headers['x-lang'] as string;
  if (lang) {
    return lang;
  }
};
