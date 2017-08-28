// Load environment variables from .env file. Surpress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true });
const debug = require('debug');

const { CONTENT, DIST_CONTENT_PATH } = require('./paths');

const configValue = {};
// Any configuration under server won't be exposed to the client
configValue.server = {};
configValue.environment = getEnvOrDefault('NODE_ENV', 'development');


configValue.port = getEnvOrDefault('PORT', 5001);
configValue.protocol = getEnvOrDefault('PROTOCOL', 'http');
configValue.hostname = getEnvOrDefault('HOSTNAME', 'localhost');

if (configValue.environment === 'development') {
  configValue.assetsPort = getEnvOrDefault('DEV_ASSETS_PORT', '5000');
  configValue.publicAssets = `${configValue.protocol}://${configValue.hostname}:${configValue.assetsPort}`;
} else {
  configValue.publicAssets = getEnvOrDefault('CDN_URL', '');
}

configValue.staticAssetsCache = getEnvOrDefault('STATIC_CACHE_DURATION', 1000 * 60 * 60 * 24 * 30); // 30 days
configValue.dynamicCache = getEnvOrDefault('DYNAMIC_CACHE_DURATION', 0); // 0 ms

configValue.contentDir = configValue.environment === 'development' ? CONTENT : DIST_CONTENT_PATH;
configValue.server.mongodbConnectionString = getEnvOrDefault('MONGODB_CONNECTION', 'mongodb://localhost/test');
configValue.server.raven = process.env.RAVEN_SERVER !== 'PASTE_SERVER_URL_FROM_SENTRY' ? process.env.RAVEN_SERVER : false;
configValue.raven = process.env.RAVEN_CLIENT !== 'PASTE_CLIENT_URL_FROM_SENTRY' ? process.env.RAVEN_CLIENT : false;
configValue.release = process.env.RELEASE_HASH;
configValue.server.sessionSecret = process.env.SESSION_SECRET;
configValue.server.allowedStyles = process.env.ALLOWED_STYLES.split(',');
configValue.server.allowedScripts = process.env.ALLOWED_SCRIPTS.split(',');
configValue.server.allowedFonts = process.env.ALLOWED_FONTS.split(',');
configValue.server.allowedWSS = process.env.ALLOWED_WSS.split(',');
configValue.server.allowedImages = process.env.ALLOWED_IMAGES.split(',');
configValue.server.twitch = {
  id: getEnvOrDefault('TWITCH_CLIENT_ID', ''),
  secret: getEnvOrDefault('TWITCH_CLIENT_SECRET', ''),
  callbackUrl: getEnvOrDefault('TWITCH_CALLBACK_URL', '')
};
configValue.server.liveedu = {
  id: getEnvOrDefault('LIVEEDU_CLIENT_ID', ''),
  secret: getEnvOrDefault('LIVEEDU_CLIENT_SECRET', ''),
  callbackUrl: getEnvOrDefault('LIVEEDU_CALLBACK_URL', '')
};

debug.enable(process.env.DEBUG);

module.exports = configValue;

function getEnvOrDefault(key, defaultValue) {
  if (!process.env[key]) {
    if (typeof defaultValue === 'undefined' && process.env.NODE_ENV !== 'test') {
      console.warn('WARNING: Missing ENV var ', key); //eslint-disable-line
      debug(`WARNING: Missing ENV var ${key}`);
    } else {
      process.env[key] = defaultValue;
    }
  }
  return process.env[key];
}
