import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Status from './components/Status';
import Home from './containers/Home';

const NotFound = () => (
  <div>
    <Status code="404" />
    Not Found
  </div>
);

class Root extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired
  }

  static childContextTypes = {
    config: PropTypes.object
  }

  getChildContext() {
    return {
      config: this.props.config
    };
  }

  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

export default Root;
