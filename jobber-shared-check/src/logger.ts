import winston, { Logger, LoggerOptions } from 'winston';
import { Client } from '@elastic/elasticsearch';

export const winstonLogger = (
  elasticsearchNode: string,
  name: string,
  level: LoggerOptions['level']
): Logger => {
  const client = new Client({
    node: elasticsearchNode,
    auth: {
      username: process.env.ELASTIC_SEARCH_USERNAME || '',
      password: process.env.ELASTIC_SEARCH_PASSWORD || '',
    },
  });

  const logger = winston.createLogger({
    level,
    exitOnError: false,
    defaultMeta: {
      service: name,
    },
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        level,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });

  const sendToElasticsearch = (
    logLevel: string,
    message: string,
    meta?: Record<string, unknown>
  ): void => {
    client
      .index({
        index: `jobber-logs-${new Date().toISOString().slice(0, 10)}`,
        document: {
          '@timestamp': new Date().toISOString(),
          service: name,
          level: logLevel,
          message,
          ...meta,
        },
      })
      .catch((error: unknown) => {
        console.error('Elasticsearch logging error:', error);
      });
  };

  logger.on('data', (info) => {
    const { level: logLevel, message, ...meta } = info;

    sendToElasticsearch(
      String(logLevel),
      String(message),
      meta as Record<string, unknown>
    );
  });

  return logger;
};
