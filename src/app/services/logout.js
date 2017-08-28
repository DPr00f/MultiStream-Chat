import axios from 'axios';
import {
  LOGOUT
} from '../actions/types';

export default function logout({ dispatch }) {
  return next => action => {
    next(action);
    switch (action.type) {
      case LOGOUT:
        axios.get(action.url)
          .then(response => {
            dispatch({ type: `${LOGOUT}_${action.service}_COMPLETE`, payload: response.data });
          })
          .catch(err => {
            dispatch({ type: `${LOGOUT}_${action.service}_FAILED`, failed: err.message });
          });
        break;
      default:
        break;
    }
  };
}
