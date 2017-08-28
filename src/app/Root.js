import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Status from './components/Status';
import Home from './containers/Home';
import Site from './containers/Site';
import Page from './containers/Page';
import Menu from './components/Menu';
import MenuButton from './containers/MenuButton';

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
      <Site>
        <Menu />
        <Page>
          <MenuButton />
          <Switch>
            <Route path="/" component={Home} />
            <Route component={NotFound} />
          </Switch>
        </Page>
      </Site>
    );
  }
}

export default Root;
