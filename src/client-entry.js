/* eslint-disable global-require, no-underscore-dangle */
import 'core-js';
import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router-dom/BrowserRouter';
import debug from 'debug';
import { Provider } from 'react-redux';
import Raven from 'raven-js';
import './client-configuration';
import { getENV } from './app/env';
import configureStore from './app/store';
import ReactHotLoader from './app/ReactHotLoader';
import { INITIAL_CONSTRUCT } from './app/constants';
import './styles/main.scss';

const isDev = process.env.NODE_ENV !== 'production';
debug.enable(process.env.DEBUG);
const log = debug('stream-chat:client');
log('Client environment %s', process.env);

const rootEl = document.getElementById('app');
const config = getENV();
log('configuring client env with %j', config);

if (config.environment === 'production' && config.raven) {
  let ravenConfig = null;
  if (config.release) {
    ravenConfig = {
      release: config.release
    };
  }
  Raven.config(config.raven, ravenConfig).install();
}

log('received initial state', window.__INITIAL_STATE__);
// creating store with registry
const store = configureStore(window.__INITIAL_STATE__ || {});
// dispatch initial state construction to update dynamic values
store.dispatch({ type: INITIAL_CONSTRUCT });

const render = RootEl => {
  const app = (
    <Provider store={store}>
      <ReactHotLoader>
        <Router><RootEl config={config} /></Router>
      </ReactHotLoader>
    </Provider>
  );

  ReactDOM.render(app, rootEl);
};

// set up hot reloading on the client
if (isDev && module.hot) {
  module.hot.accept('./app/Root', () => {
    const Root = require('./app/Root').default; // eslint-disable-line no-shadow
    render(Root);
  });
}
const Root = require('./app/Root').default;

render(Root);
