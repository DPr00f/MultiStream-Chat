import { createStore, compose, combineReducers } from 'redux';
import reducers from '../reducers';

const debugEnhancer =
  typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ?
    window.devToolsExtension() :
    f => f;

export default function configureStore(initialState = {}) {
  const initialReducers = combineReducers(reducers);

  const enhancer = compose(
    debugEnhancer
  );

  const store = createStore(initialReducers, initialState, enhancer);

  return store;
}
