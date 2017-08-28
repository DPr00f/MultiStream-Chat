import url from 'url';
import request from 'request';
import OAuth2 from './OAuth2';
import { getENV } from '../../app/env';

const config = getENV();

class LiveEdu extends OAuth2 {
  constructor() {
    super({
      authorizationURL: 'https://www.liveedu.tv/o/authorize/',
      tokenURL: 'https://www.liveedu.tv/o/token/',
      clientID: config.server.liveedu.id,
      clientSecret: config.server.liveedu.secret,
      callbackURL: url.resolve(config.server.liveedu.callbackUrl, 'api/liveedu_oauth'),
      state: true
    });
    this.loginPage = this.loginPage.bind(this);
    this.authenticate = this.authenticate.bind(this);
  }

  getUserData(accessToken) {
    return new Promise((resolve, reject) => {
      const options = {
        url: 'https://www.liveedu.tv/api/v2/me/chat/credentials/',
        method: 'GET',
        headers: {
          'Client-ID': config.server.liveedu.id,
          Authorization: `Bearer ${accessToken}`
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
    req.session.liveedu = {
      display_name: session.user.user.username,
      name: session.user.user.slug,
      chat: {
        jid: session.user.jid,
        password: session.user.password,
        color: session.user.color
      },
      accessToken: this.sessionData.accessToken,
      refreshToken: this.sessionData.refreshToken
    };
  }

  loginPage(req, res) {
    super.loginPage(req, res, { scope: ['read', 'read:user', 'chat'] });
  }

  authenticate(req, res) {
    super.authenticate(req, res);
  }
}

export default LiveEdu;
