/* eslint-disable no-param-reassign */
import passport from 'passport';
import request from 'request';
import url from 'url';
import { OAuth2Strategy } from 'passport-oauth';
import { getENV } from '../../app/env';

const config = getENV();

const liveEduPassport = new passport.Passport();

liveEduPassport.serializeUser((user, done) => {
  console.log('got user', user);
  done(null, {
    liveedu: user
  });
});

liveEduPassport.deserializeUser((user, done) => {
  if (user.service === 'liveedu') {
    done(null, {
      liveedu: user
    });
  } else {
    done(null, {
      twitch: user
    });
  }
});

const liveEduStrat = new OAuth2Strategy(
  {
    authorizationURL: 'https://www.liveedu.tv/o/authorize/',
    tokenURL: 'https://www.liveedu.tv/o/token/',
    clientID: config.server.liveedu.id,
    clientSecret: config.server.liveedu.secret,
    callbackURL: url.resolve(config.server.twitch.callbackUrl, 'api/liveedu_oauth'),
    state: true
  },
  (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    done(null, profile);
  }
);

// Override passport profile function to get user profile from LiveEdu API
liveEduStrat.userProfile = function userProfile(accessToken, done) {
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
      done(null, { ...JSON.parse(body), service: 'liveedu' });
    } else {
      done({ ...JSON.parse(body), service: 'liveedu' });
    }
  });
};

liveEduPassport.use('liveedu', liveEduStrat);

export default liveEduPassport;
