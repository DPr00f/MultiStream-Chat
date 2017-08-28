/* eslint-disable react/no-danger */
/* eslint-disable react/no-unused-prop-types */
/* test */
import React from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';

const Html = (
  {
    head,
    style,
    assets,
    body,
    nonce,
    config,
    initialState,
    i18n,
    asyncState
  }
) => {
  const attrs = head.htmlAttributes.toComponent();
  const { lang, ...rest } = attrs || {};
  const trackingId = config && config.analytics && config.analytics.google && config.analytics.google.trackingId;
  let localScript = `window.__CONFIG__ = ${serialize(config, { isJSON: true })};`;
  localScript += `window.__INITIAL_STATE__ = ${serialize(initialState || {}, { isJSON: true })};`;
  if (asyncState) {
    localScript += `window.__ASYNC_COMPONENTS_STATE__ = ${serialize(asyncState, { isJSON: true })};`;
  }
  if (trackingId) {
    localScript += `window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;ga('create','${trackingId}','auto');ga('send','pageview')`;
  }
  if (i18n) {
    localScript += `window.__i18n=${serialize(i18n)};`;
  }
  return (
    <html {...rest} lang={lang || 'en'}>
      <head>
        {head.title.toComponent()}
        <meta charSet="utf-8" />
        <meta name="identity-build-tag" content={config.tag} />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {head.meta.toComponent()}
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <link rel="stylesheet" type="text/css" href="/css/font-awesome.min.css" />
        {assets && assets.vendor && assets.vendor.css
          ? <link rel="stylesheet" type="text/css" href={assets.vendor.css} />
          : null}
        {assets && assets.app && assets.app.css
          ? <link rel="stylesheet" type="text/css" href={assets.app.css} />
          : null}
        {head.link.toComponent()}
        {style ? <style nonce={nonce} id="css" dangerouslySetInnerHTML={{ __html: style }} /> : null}
      </head>
      <body>
        <div id="app" className="ml-layout-app" dangerouslySetInnerHTML={{ __html: body }} />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: localScript }} />
        {assets && assets.vendor && assets.vendor.js ? <script src={assets.vendor.js} /> : null}
        {assets && assets.app && assets.app.js ? <script src={assets.app.js} /> : null}
        {trackingId ? <script src="https://www.google-analytics.com/analytics.js" async defer /> : null}
      </body>
    </html>
  );
};

Html.defaultProps = {
  stylesheet: [],
  initialState: null,
  codeSplitState: null,
  style: null,
  asyncState: null,
  assets: {},
  i18n: null
};

Html.propTypes = {
  head: PropTypes.shape({
    title: PropTypes.object,
    meta: PropTypes.object,
    link: PropTypes.object
  }).isRequired,
  assets: PropTypes.object,
  config: PropTypes.shape({
    analytics: PropTypes.shape({
      google: PropTypes.shape({
        trackingId: PropTypes.string
      })
    })
  }).isRequired,
  initialState: PropTypes.object,
  asyncState: PropTypes.object,
  nonce: PropTypes.string.isRequired,
  style: PropTypes.string,
  body: PropTypes.node.isRequired,
  i18n: PropTypes.object
};

export default Html;
