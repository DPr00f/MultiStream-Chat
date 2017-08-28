import createReducer from '../store/createReducer';
import { LIVE_EDU_JOIN_ROOM } from '../actions/types';

const initialState = {
  rooms: []
};
export default createReducer(initialState, {
  [LIVE_EDU_JOIN_ROOM]: (state, action) => ({ rooms: [...state.rooms, action.roomName] })
});
