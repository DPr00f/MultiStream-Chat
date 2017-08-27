import { Children } from 'react';

// Only load RHL when in development
const ReactHotLoader =
  process.env.NODE_ENV === 'development' ?
    require('react-hot-loader').AppContainer :
    ({ children }) => Children.only(children);

export default ReactHotLoader;
