import createReducer from '../store/createReducer';
import { TOGGLE_MENU } from '../actions/types';

const initialState = false;
export default createReducer(initialState, {
  [TOGGLE_MENU]: state => (!state)
});
