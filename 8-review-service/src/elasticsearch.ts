import { Client, estypes } from '@elastic/elasticsearch';
import { config } from '@review/config';
import { ISellerGig, winstonLogger } from '@mayank30041995/jobber-shared';
import { Logger } from 'winston';

type ClusterHealthResponse = estypes.ClusterHealthResponse;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: config.ELASTIC_SEARCH_URL,
  auth: {
    username: config.ELASTIC_SEARCH_USERNAME!,
    password: config.ELASTIC_SEARCH_PASSWORD!
  }
});

async function checkConnection(): Promise<void> {
  let isConnected = false;

  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health();

      log.info(`OrderService Elasticsearch health status - ${health.status}`);

      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.log('error', 'OrderService checkConnection() method:', error);
    }
  }
}

export { elasticSearchClient, checkConnection };
