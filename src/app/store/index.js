import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import reducers from '../reducers';
import services from '../services';

let globalStore;
const debugEnhancer =
  typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ?
    window.devToolsExtension() :
    f => f;

export default function configureStore(initialState = {}) {
  const initialReducers = combineReducers(reducers);

  const enhancer = compose(
    applyMiddleware(...services),
    debugEnhancer
  );

  const store = createStore(initialReducers, initialState, enhancer);
  globalStore = store;
  return store;
}

export function getStore() {
  return globalStore;
}
