/* eslint-disable import/prefer-default-export */
import {
  TOGGLE_MENU,
  LOGOUT
} from './types';

export const toggleMenu = () => ({
  type: TOGGLE_MENU
});

export const logoutTwitch = () => ({
  type: LOGOUT,
  service: 'TWITCH',
  url: '/auth/twitch/logout'
});

export const logoutLiveEdu = () => ({
  type: LOGOUT,
  service: 'LIVE_EDU',
  url: '/auth/liveedu/logout'
});
