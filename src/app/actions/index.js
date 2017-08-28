/* eslint-disable import/prefer-default-export */
import {
  TOGGLE_MENU,
  LOGOUT,
  LIVE_EDU_JOIN_ROOM
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

export const liveEduJoinRoom = roomName => ({
  type: LIVE_EDU_JOIN_ROOM,
  roomName
});
