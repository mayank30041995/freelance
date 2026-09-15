import 'express-async-errors';
import { Application } from 'express';
import http from 'http';
import { IEmailMessageDetails, winstonLogger } from '@mayank30041995/jobber-shared';
import { Logger } from 'winston';
import { Channel } from 'amqplib';
import { config } from '@notifications/config';
import { healthRoutes } from '@notifications/routes';
import { checkConnection } from '@notifications/elasticsearch';
import { createConnection } from '@notifications/queues/connection';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';

const SERVER_PORT = 4001;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoutes());
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
  const emailChannel: Channel = (await createConnection()) as Channel;
  await consumeAuthEmailMessages(emailChannel);
  await consumeOrderEmailMessages(emailChannel);
  const varificationLink = `${config.CLIENT_URL}/confirm_email?v_token=GSUDJDG343HJSDYDYUDTDT}`;

  const messageDetails: IEmailMessageDetails = {
    receiverEmail: `${config.SENDER_EMAIL}`,
    resetLink: varificationLink,
    username: 'Mayank',
    template: 'forgotPassword'
  };
  await emailChannel.assertExchange('jobber-email-notification', 'direct');
  // const message1 = JSON.stringify({ name: 'Jobber', service: 'emain notification service' });
  const message = JSON.stringify(messageDetails);
  emailChannel.publish('jobber-email-notification', 'auth-email', Buffer.from(message));

  // await emailChannel.assertExchange('jobber-order-notification', 'direct');
  // const message2 = JSON.stringify({ name: 'Jobber', service: 'order notification service' });
  // emailChannel.publish('jobber-order-notification', 'order-email', Buffer.from(message2));
}

function startElasticSearch(): void {
  checkConnection();
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Worker with process id of ${process.pid} on notification server has started`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Notification server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'NotificationService startServer() method:', error);
  }
}
