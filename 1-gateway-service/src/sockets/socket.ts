import { config } from '@gateway/config';
import { GatewayCache } from '@gateway/redis/gateway.cache';
import { IMessageDocument, IOrderDocument, IOrderNotifcation, winstonLogger } from '@mayank30041995/jobber-shared';
import { Server, Socket } from 'socket.io';
import { io, Socket as SocketClient } from 'socket.io-client';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewaySocket', 'debug');

let chatSocketClient: SocketClient;
let orderSocketClient: SocketClient;

export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache;

  constructor(io: Server) {
    this.io = io;
    this.gatewayCache = new GatewayCache();
  }

  public listen(): void {
    // this.chatSocketServiceIOConnections();
    // this.orderSocketServiceIOConnections();

    this.io.on('connection', async (socket: Socket) => {
      log.info(`Gateway client connected: ${socket.id}`);

      socket.on('getLoggedInUsers', async () => {
        const response: string[] = await this.gatewayCache.getLoggedInUsersFromCache('loggedInUsers');

        this.io.emit('online', response);
      });

      socket.on('loggedInUsers', async (username: string) => {
        const response: string[] = await this.gatewayCache.saveLoggedInUserToCache('loggedInUsers', username);

        this.io.emit('online', response);
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        const response: string[] = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', username);

        this.io.emit('online', response);
      });

      socket.on('category', async (category: string, username: string) => {
        await this.gatewayCache.saveUserSelectedCategory(`selectedCategories:${username}`, category);
      });

      socket.on('disconnect', (reason) => {
        log.info(`Gateway client disconnected: ${socket.id}, reason: ${reason}`);
      });
    });
  }

  private chatSocketServiceIOConnections(): void {
    chatSocketClient = io(config.MESSAGE_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    chatSocketClient.on('connect', () => {
      log.info(`ChatService socket connected: ${chatSocketClient.id}`);
    });

    chatSocketClient.on('disconnect', (reason) => {
      log.warn(`ChatService socket disconnected: ${reason}`);
    });

    chatSocketClient.on('connect_error', (error) => {
      log.error(`ChatService socket connection error: ${error.message}`);
    });

    chatSocketClient.on('message received', (data: IMessageDocument) => {
      this.io.emit('message received', data);
    });

    chatSocketClient.on('message updated', (data: IMessageDocument) => {
      this.io.emit('message updated', data);
    });
  }

  //   private orderSocketServiceIOConnections(): void {
  //     orderSocketClient = io(config.ORDER_BASE_URL, {
  //       transports: ['websocket', 'polling'],
  //       reconnection: true,
  //       reconnectionAttempts: Infinity,
  //       reconnectionDelay: 1000,
  //       reconnectionDelayMax: 5000
  //     });

  //     orderSocketClient.on('connect', () => {
  //       log.info(`OrderService socket connected: ${orderSocketClient.id}`);
  //     });

  //     orderSocketClient.on('disconnect', (reason) => {
  //       log.warn(`OrderService socket disconnected: ${reason}`);
  //     });

  //     orderSocketClient.on('connect_error', (error) => {
  //       log.error(`OrderService socket connection error: ${error.message}`);
  //     });

  //     orderSocketClient.on('order notification', (order: IOrderDocument, notification: IOrderNotifcation) => {
  //       this.io.emit('order notification', order, notification);
  //     });
  //   }
}
