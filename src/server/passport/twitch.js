/* eslint-disable no-param-reassign */
import passport from 'passport';
import request from 'request';
import url from 'url';
import { OAuth2Strategy } from 'passport-oauth';
import { getENV } from '../../app/env';

const config = getENV();

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function userProfile(accessToken, done) {
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
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
};

// Remove unnecessary params
function getUserClient({ display_name, name, accessToken }) {
  return { display_name, name, accessToken };
}

passport.serializeUser((user, done) => {
  done(null, {
    twitch: user,
    clientTwitch: getUserClient(user)
  });
});

passport.deserializeUser((user, done) => {
  done(null, {
    twitch: user,
    clientTwitch: getUserClient(user)
  });
});

passport.use('twitch', new OAuth2Strategy(
  {
    authorizationURL: 'https://api.twitch.tv/kraken/oauth2/authorize',
    tokenURL: 'https://api.twitch.tv/kraken/oauth2/token',
    clientID: config.server.twitch.id,
    clientSecret: config.server.twitch.secret,
    callbackURL: url.resolve(config.server.twitch.callbackUrl, 'api/twitch_oauth'),
    state: true
  },
  (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    done(null, profile);
  }
));
