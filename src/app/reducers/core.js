import createReducer from '../store/createReducer';
import { LOGOUT_TWITCH_COMPLETE, LOGOUT_LIVE_EDU_COMPLETE } from '../actions/types';

const initialState = {};
export default createReducer(initialState, {
  [LOGOUT_TWITCH_COMPLETE]: ({twitch, ...rest}) => ({ ...rest }),
  [LOGOUT_LIVE_EDU_COMPLETE]: ({liveedu, ...rest}) => ({ ...rest })
});
