import express from 'express';
import debug from 'debug';
import Raven from 'raven';
import renderApp from './middleware/renderApp';
import { onError } from './middleware/error';

const log = debug('stream-chat:router');

export const routingApp = express();

export function setRoutes(config, buildAssets) {
  const assets = buildAssets();
  log('adding react routes');

  routingApp.use((req, res, next) => {
    routingApp.locals.initialState = routingApp.locals.initialState || {};
    routingApp.locals.config = routingApp.locals.config || {};
    routingApp.locals.config.nonce = res.locals.nonce;
    next();
  });
  routingApp.get('/qrentry/:id', (req, res) => {
    const id = req.params.id;
    const ref = firebase.database().ref(`/entry/${id}`);
    ref.once('value')
      .then(snapshot => {
        const val = snapshot.val();
        if (!val) {
          renderApp(assets, config, routingApp)(req, res);
          return;
        }
        ref.child('validated').set(true);
        res.send("The qr code should disappear and you'll be able to view the website. Enjoy.");
      })
      .catch(err => {
        console.error(err);
        res.status(501).send('An error was found, let an administrator know.');
      });
  });
  routingApp.get('*', renderApp(assets, config, routingApp));

  if (config.server.raven) {
    routingApp.use(Raven.errorHandler());
  }

  // custom error response to client
  routingApp.use(onError);
}
