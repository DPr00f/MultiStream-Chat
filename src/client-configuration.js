/* eslint-disable global-require, no-underscore-dangle */
import { configureENV } from './app/env';

const config = window.__CONFIG__ || {};

configureENV(config);
