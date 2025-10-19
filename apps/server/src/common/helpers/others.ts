import { Request } from 'express';
import { chunk, random } from 'lodash';

export const isNullOrUndefined = (value: any) => {
  return value === null || value === undefined;
};

/**
 * Get the first field that is not null or undefined
 * @param obj - Object to get the field from
 * @param fields - List of fields to check
 * @returns The first field that is not null or undefined
 */
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

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Send requests in chunks to avoid overwhelming the server
 * @param itemList - List of items to send requests for
 * @param requestFn - Function to send request for each item
 * @param chunkSize - Size of each chunk, to be sent together by Promise.all
 * @param sleepMs - Time to sleep between chunks
 * @returns List of results
 */
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

/**
 * Use this to define the random sleep time for cron jobs, avoid running multiple cron job at the same time
 * @param options - Options for the random sleep time
 * @returns
 */
export const getRandomSleepTimeForCronJob = (options?: {
  min?: number;
  max?: number;
}) => {
  const { min = 5000, max = 10000 } = options || {};
  return random(min, max);
};
