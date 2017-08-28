import express from 'express';
import debug from 'debug';
import Raven from 'raven';
import renderApp from './middleware/renderApp';
import { onError } from './middleware/error';
import TwitchController from './controllers/Twitch';
import LiveEduController from './controllers/LiveEdu';

const twitchController = new TwitchController();
const liveEduController = new LiveEduController();

const log = debug('stream-chat:router');

export const routingApp = express();

export function setRoutes(config, buildAssets) {
  const assets = buildAssets();
  log('adding react routes');

  routingApp.use((req, res, next) => {
    routingApp.locals.initialState = {};
    if (!routingApp.locals.initialState.core) {
      routingApp.locals.initialState.core = {};
    }
    routingApp.locals.initialState = routingApp.locals.initialState || {};
    routingApp.locals.config = routingApp.locals.config || {};
    routingApp.locals.config.nonce = res.locals.nonce;
    if (req.session && req.session.twitch) {
      routingApp.locals.initialState.core.twitch = req.session.twitch;
    }
    if (req.session && req.session.liveedu) {
      routingApp.locals.initialState.core.liveedu = req.session.liveedu;
    }
    next();
  });
  routingApp.get('/auth/twitch/logout', (req, res) => {
    delete req.session.twitch;
    res.json({ message: 'Logged out from Twitch' });
  });
  routingApp.get('/auth/liveedu/logout', (req, res) => {
    delete req.session.liveedu;
    res.json({ message: 'Logged out from LiveEdu' });
  });
  routingApp.get('/auth/twitch', twitchController.loginPage);
  routingApp.get('/api/twitch_oauth', twitchController.authenticate);
  routingApp.get('/auth/liveedu', liveEduController.loginPage);
  routingApp.get('/api/liveedu_oauth', liveEduController.authenticate);
  routingApp.get('*', renderApp(assets, config, routingApp));

  if (config.server.raven) {
    routingApp.use(Raven.errorHandler());
  }

  // custom error response to client
  routingApp.use(onError);
}
