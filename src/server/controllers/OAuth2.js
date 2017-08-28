import uuid from 'uuid/v1';
import { OAuth2 } from 'oauth';

class OAuth2Controller {
  constructor(options) {
    this.options = options;
    this.sessionData = {};
    this.oauth2 = new OAuth2(options.clientID, options.clientSecret, '', options.authorizationURL, options.tokenURL, options.customHeaders);
  }

  loginPage(req, res, options = {}) {
    let state = '';
    if (this.options.state) {
      req.session.oauthState = uuid();
      state = `&state=${req.session.oauthState}`;
    }
    const scope = Array.isArray(options.scope) ? options.scope.join('+') : options.scope;
    const { authorizationURL, clientID, callbackURL } = this.options;
    const url = `${authorizationURL}?client_id=${clientID}&redirect_uri=${encodeURIComponent(callbackURL)}&response_type=code&scope=${scope}${state}`;
    res.redirect(url);
  }

  saveSession(req) {
    req.session.oauth2 = { ...this.sessionData };
  }

  getTokenParams() {
    return {};
  }

  getToken(req, res) {
    const { code } = req.query;
    const params = this.getTokenParams(this.options);
    params.grant_type = 'authorization_code';
    params.redirect_uri = this.options.callbackURL;
    this.oauth2.getOAuthAccessToken(code, params, (err, accessToken, refreshToken) => {
      if (err) {
        console.error('failed to obtain access token', err);
        res.redirect('/services');
        return;
      }
      this.sessionData.accessToken = accessToken;
      this.sessionData.refreshToken = refreshToken;
      this.getUserData(accessToken).then(user => {
        this.sessionData.user = { ...user };
        this.saveSession(req, res, this.sessionData);
        res.redirect('/services');
      }).catch(error => {
        console.error(error);
        res.redirect('/services');
      });
    });
  }

  authenticate(req, res) {
    if (req.session.oauthState && req.session.oauthState !== req.query.state) {
      res.status(500).json({
        error: true,
        message: 'Unmatching state key'
      });
      return;
    }
    req.session.oauthState = null;
    delete req.session.oauthState;
    if (req.query.code) {
      this.getToken(req, res);
    } else {
      res.status(501).json({
        error: true,
        message: 'Unauthorized token'
      });
    }
  }
}

export default OAuth2Controller;
