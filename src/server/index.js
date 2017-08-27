import express from 'express';
import debug from 'debug';
import serverSetup from './setup';
import { routingApp, setRoutes } from './router';

export default function createServer(config, getAssets) {
  const log = debug('stream-chat:server');
  const server = express();

  log('starting with config: ');
  log('%O', config);
  serverSetup(server, config, getAssets);
  setRoutes(config, getAssets);
  server.use('/', routingApp);

  return server;
}
