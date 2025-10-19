import 'winston-daily-rotate-file';
import { WinstonModuleOptions } from 'nest-winston';
import { transports } from 'winston';
import { format } from 'winston';

export const getWinstonModuleOptions = (
  appName: string,
): WinstonModuleOptions => ({
  transports: [
    // let's log errors into its own file
    new transports.DailyRotateFile({
      filename: `logs/${appName}/%DATE%-error.log`,
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false, // don't want to zip our logs
      maxFiles: '30d', // will keep log until they are older than 30 days
      format: format.combine(
        format.timestamp(),
        format.printf(
          ({ timestamp, level, context, message, ...others }: any) => {
            return JSON.stringify({
              timestamp,
              level,
              context,
              message,
              otherMsg: Object.keys(others).length > 0 ? others : null,
            });
          },
        ),
      ),
    }),
    // logging all level
    new transports.DailyRotateFile({
      filename: `logs/${appName}/%DATE%-combined.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false, // don't want to zip our logs
      maxFiles: '30d', // will keep log until they are older than 30 days
      format: format.combine(
        format.timestamp(),
        format.splat(),

        format.printf(
          ({ timestamp, level, context, message, ...others }: any) => {
            return JSON.stringify({
              timestamp,
              level,
              context,
              message,
              otherMsg:
                Object.keys(others).length > 0
                  ? JSON.stringify(others).slice(0, 1000)
                  : undefined,
            });
          },
        ),
      ),
    }),
    // we also want to see logs in our console
    new transports.Console({
      format: format.combine(
        format.cli(),
        format.splat(),
        format.timestamp(),
        format.printf(
          ({ timestamp, level, context, message, ...others }: any) => {
            const baseMsg = `${timestamp} ${level}: ${context || 'Application'} ${message}`;
            const otherMsg =
              Object.keys(others).length > 0
                ? JSON.stringify(others).slice(0, 1000)
                : '';
            return [baseMsg, otherMsg].filter(Boolean).join('\n');
          },
        ),
      ),
    }),
  ],
});
