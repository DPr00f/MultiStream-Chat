/* eslint-disable no-param-reassign */
import express from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import bodyParser from 'body-parser';
import debug from 'debug';
import session from 'cookie-session';
import Raven from 'raven';
import { DIST, PUBLIC } from '../../config/paths';
import nonce from './middleware/nonce';

const log = debug('stream-chat:setup');

/**
 * function to server static assets for dev from server/public (PUBLIC) without cache
 * or from build/dist (DIST) on production with cache in place
 * @param  {object} config
 * @return static middleware
 */
function getStaticAssets(config) {
  if (config.environment === 'development') {
    log('serving external files from', PUBLIC);
    return express.static(PUBLIC);
  }

  log('serving production assets from ', DIST);
  return express.static(DIST, {
    maxAge: +config.staticAssetsCache
  });
}

export default function setup(server, config, buildAssets) {
  const assets = buildAssets();
  log('public path maps to', PUBLIC);
  log('received assets', assets);

  server.use(bodyParser.json({ limit: '100mb'}));
  server.use(bodyParser.urlencoded({limit: '100mb', extended: true }));
  server.use(session({
    name: 'multistream-chat',
    secret: config.server.sessionSecret
  }));

  server.set('etag', true);

  // Prevent HTTP Parameter pollution.
  // @see http://bit.ly/2f8q7Td
  server.use(hpp());

  // Prevent defacing
  // @see https://helmetjs.github.io/docs/csp/
  server.use(nonce());

  server.use((req, res, next) => {
    config.nonce = res.locals.nonce;
    next();
  });

  if (config.environment !== 'production') {
    server.use((req, res, next) => {
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', 0);
      next();
    });
  }

  // The xssFilter middleware sets the X-XSS-Protection header to prevent
  // reflected XSS attacks.
  // @see https://helmetjs.github.io/docs/xss-filter/
  server.use(helmet.xssFilter());

  // Frameguard mitigates clickjacking attacks by setting the X-Frame-Options header.
  // @see https://helmetjs.github.io/docs/frameguard/
  server.use(helmet.frameguard({ action: 'deny' }));

  // Sets the X-Download-Options to prevent Internet Explorer from executing
  // downloads in your site’s context.
  // @see https://helmetjs.github.io/docs/ienoopen/
  server.use(helmet.ieNoOpen());

  // Don’t Sniff Mimetype middleware, noSniff, helps prevent browsers from trying
  // to guess (“sniff”) the MIME type, which can have security implications. It
  // does this by setting the X-Content-Type-Options header to nosniff.
  // @see https://helmetjs.github.io/docs/dont-sniff-mimetype/
  server.use(helmet.noSniff());

  const allowedScripts = ["'self'", (req, res) => (`'nonce-${res.locals.nonce}'`)].concat(config.server.allowedScripts);
  const allowedStyles = ["'self'", "'unsafe-inline'"].concat(config.server.allowedStyles);
  const allowedFonts = ["'self'"].concat(config.server.allowedFonts);
  const allowedWSS = ["'self'"].concat(config.server.allowedWSS);
  const allowedImages = ["'self'"].concat(config.server.allowedImages);

  if (config.environment === 'development') {
    allowedScripts.push(config.publicAssets);
    allowedStyles.push(config.publicAssets);
    allowedFonts.push(config.publicAssets);
    allowedWSS.push(config.publicAssets);
    allowedImages.push(config.publicAssets);
  }

  server.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: allowedScripts,
      styleSrc: allowedStyles,
      fontSrc: allowedFonts,
      connectSrc: allowedWSS,
      imgSrc: allowedImages
    },
    browserSniff: false,
    disableAndroid: true
  }));

  server.use(compression());
  server.enable('view cache');
  server.enable('strict routing');

  // Don't expose any software information to potential hackers.
  server.disable('X-Powered-By');
  server.disable('x-powered-by');

  // setting logging via Raven
  if (config.environment === 'production' && config.server.raven) {
    log('configure production logging');
    let ravenConfig = null;
    if (config.release) {
      ravenConfig = {
        release: config.release
      };
    }
    Raven.config(config.server.raven, ravenConfig).install();
    log(config.server.raven);
    server.use(Raven.requestHandler());
  }

  // setting headers and static assets
  server
    .use((req, res, next) => {
      res.removeHeader('X-Powered-By');
      next();
    })
    .use(getStaticAssets(config))
    .use(compression());

  // setting dynamicCache for html page
  if (config.environment === 'production') {
    server.use((req, res, next) => {
      res.set('Cache-Control', `private, max-age=${config.dynamicCache}`);
      next();
    });
  }
}
