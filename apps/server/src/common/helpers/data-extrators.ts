import { Request } from 'express';

export const extractIpAddressFromRequest = (req: Request) => {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress;
  return ip;
};

export const extractUserAgentFromRequest = (req: Request) => {
  return req.headers['user-agent'];
};
