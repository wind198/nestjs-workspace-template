import { Request } from 'express';
import { chunk, random } from 'lodash';
import { I18nService } from 'nestjs-i18n';

export const isNullOrUndefined = (value: any) => {
  return value === null || value === undefined;
};

export const getFieldWithFallbacks = (
  obj: Record<string, any>,
  fields: string[],
) => {
  for (const field of fields) {
    const value = obj[field];
    if (!isNullOrUndefined(value)) {
      return value;
    }
  }
  return undefined;
};

export const appendToPathname = (pathname: string, subPathToAdd: string) => {
  return [pathname.replace(/\/+$/, ''), subPathToAdd].join('/');
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sendRequestInChunks = async <T, P = any>(
  itemList: T[],
  requestFn: (item: T) => Promise<P>,
  chunkSize: number = 5,
  sleepMs: number = 1000,
) => {
  const results = [] as P[];
  for (const $chunk of chunk(itemList, chunkSize)) {
    results.push(...(await Promise.all($chunk.map(requestFn))));
    await sleep(sleepMs);
  }
  return results;
};

export const getLangFromRequest = (
  request: Request,
  i18nService: I18nService,
) => {
  const langAcceptHeader =
    request.headers['accept-language']?.split(',')[0]?.trim() || '';
  const lang = i18nService.resolveLanguage(langAcceptHeader);
  return lang;
};

export const generateCodeFromName = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};

export const getRandomSleepTimeForCronJob = (options?: {
  min?: number;
  max?: number;
}) => {
  const { min = 5000, max = 10000 } = options || {};
  return random(min, max);
};

export const generateItemListString = (list: string[], limit?: number) => {
  if (limit && limit >= list.length) {
    limit = 0;
  }
  if (!list.length) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return list.join(', ');
  return [
    list.slice(0, limit || list.length - 1).join(', '),
    ...(limit ? [`${list.length - limit} more`] : [list[list.length - 1]]),
  ].join(' and ');
};
