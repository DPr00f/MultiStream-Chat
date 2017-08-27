import 'core-js';
import 'ignore-styles';
import debug from 'debug';
import './server-configuration';
import getAssets from '../config/assets';
import createServer from './server';
import { getENV } from './app/env';

debug.enable(process.env.DEBUG);

const log = debug('stream-chat:server');
const config = getENV();

// Tell any CSS tooling to use all vendor prefixes if the
// user agent is not known.
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

const server = createServer(config, getAssets);

server.listen(config.port, () => {
  log(`listening at http://localhost:${config.port}`);
});
