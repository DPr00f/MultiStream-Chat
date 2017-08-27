import express from 'express';
import debug from 'debug';
import Raven from 'raven';
import passport from 'passport';
import renderApp from './middleware/renderApp';
import { onError } from './middleware/error';

const log = debug('stream-chat:router');

export const routingApp = express();

export function setRoutes(config, buildAssets) {
  const assets = buildAssets();
  log('adding react routes');

  routingApp.use((req, res, next) => {
    if (routingApp.locals.initialState) {
      routingApp.locals.initialState = {};
    }
    routingApp.locals.initialState = routingApp.locals.initialState || {};
    routingApp.locals.config = routingApp.locals.config || {};
    routingApp.locals.config.nonce = res.locals.nonce;
    if (req.session && req.session.passport && req.session.passport.user && req.session.passport.user.clientTwitch) {
      if (!routingApp.locals.initialState.core) {
        routingApp.locals.initialState.core = {};
      }
      routingApp.locals.initialState.core.twitch = req.session.passport.user.clientTwitch;
    }
    next();
  });
  routingApp.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));
  routingApp.get('/api/twitch_oauth', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));
  routingApp.get('*', renderApp(assets, config, routingApp));

  if (config.server.raven) {
    routingApp.use(Raven.errorHandler());
  }

  // custom error response to client
  routingApp.use(onError);
}
