import url from 'url';
import request from 'request';
import OAuth2 from './OAuth2';
import { getENV } from '../../app/env';

const config = getENV();

class Twitch extends OAuth2 {
  constructor() {
    super({
      authorizationURL: 'https://api.twitch.tv/kraken/oauth2/authorize',
      tokenURL: 'https://api.twitch.tv/kraken/oauth2/token',
      clientID: config.server.twitch.id,
      clientSecret: config.server.twitch.secret,
      callbackURL: url.resolve(config.server.twitch.callbackUrl, 'api/twitch_oauth'),
      state: true
    });
    this.loginPage = this.loginPage.bind(this);
    this.authenticate = this.authenticate.bind(this);
  }

  getUserData(accessToken) {
    return new Promise((resolve, reject) => {
      const options = {
        url: 'https://api.twitch.tv/kraken/user',
        method: 'GET',
        headers: {
          'Client-ID': config.server.twitch.id,
          Accept: 'application/vnd.twitchtv.v5+json',
          Authorization: `OAuth ${accessToken}`
        }
      };

      request(options, (error, response, body) => {
        if (response && response.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(JSON.parse(body));
        }
      });
    });
  }

  saveSession(req, res, session) {
    req.session.twitch = {
      display_name: session.user.display_name,
      name: session.user.name,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    };
  }

  loginPage(req, res) {
    super.loginPage(req, res, { scope: ['user_read', 'chat_login'] });
  }

  authenticate(req, res) {
    super.authenticate(req, res);
  }
}

export default Twitch;
