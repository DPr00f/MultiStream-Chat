import { Provider as ReduxProvider } from 'react-redux';
import ServerTiming from 'servertiming';
import debug from 'debug';
import React from 'react';
import StaticRouter from 'react-router/StaticRouter';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import Helmet from 'react-helmet';
import UrlParser from 'url';
import buildClientConfig from './buildClientConfig';
import Root from '../../app/Root';
import Html from '../templates/Html';
import configureStore from '../../app/store';
import { INITIAL_CONSTRUCT } from '../../app/constants';

const log = debug('stream-chat:server:render');
const perfomanceLog = debug('stream-chat:server:perfomance');

const App = (store, req, routerContext, config) => (
  <ReduxProvider store={store}>
    <StaticRouter location={req.url} context={routerContext}>
      <Root config={config} />
    </StaticRouter>
  </ReduxProvider>
);

const renderPage = (body, head, initialState, nonce, config, assets = {}) => {
  perfomanceLog('rendering page result for ');
  const html = renderToStaticMarkup(
    <Html
      body={body || ''}
      head={head}
      initialState={initialState}
      config={config}
      nonce={nonce}
      assets={assets} />
  );

  return `<!doctype html>${html}`;
};

export function getClientConfig(routingApp, req, config, reqUrl) {
  return new Promise(resolve => {
    let componentUrl = reqUrl;
    let ref;
    if (!componentUrl) {
      ref = req.get('Referrer');
      componentUrl = UrlParser.parse(ref).pathname;
    }

    const newConfig = { ...routingApp.locals.config, ...config };
    const clientConfig = buildClientConfig(newConfig);
    const initialData = routingApp.locals.initialState || {};

    // creating store
    const store = configureStore(initialData);
    // dispatch initial state construction to update dynamic values
    store.dispatch({ type: INITIAL_CONSTRUCT });
    const routerContext = {};
    const app = App(store, { url: componentUrl }, routerContext, clientConfig);
    const appString = renderToString(app);
    const initialState = store.getState();
    resolve({
      initialState,
      clientConfig,
      routerContext,
      appString
    });
  });
}

export default function renderAppWrapper(assets, config, routingApp) {
  return async (req, res, next) => {
    const timing = new ServerTiming();
    timing.startTimer('Render');

    perfomanceLog(`request started for ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    const data = await getClientConfig(routingApp, req, config, req.url);
    const { appString, initialState, clientConfig, routerContext } = data;
    const body = appString;
    // getting head
    const head = Helmet.rewind();

    if (routerContext.url) {
      timing.stopTimer('Render');
      res.setHeader('Server-Timing', timing.generateHeader());
      // we got URL - this is a signal that redirect happened
      res.status(301).setHeader('Location', routerContext.url);

      perfomanceLog(`request ended for ${req.protocol}://${req.get('host')}${req.originalUrl}`);
      res.end();
      next();
      return;
    }
    // checking is page is 404
    let status = 200;
    if (routerContext.status === '404') {
      log('sending 404 for ', req.url);
      status = 404;
    } else {
      log('router resolved to actual page');
    }

    // rendering result page
    const page = renderPage(body, head, initialState, res.locals.nonce, clientConfig, assets);
    timing.stopTimer('Render');
    res.setHeader('Server-Timing', timing.generateHeader());
    res.status(status).send(page);

    perfomanceLog(`request ended for ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
  };
}
