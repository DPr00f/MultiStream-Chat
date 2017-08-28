import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Route from 'react-router-dom/Route';
import Services from './Services';

const hoc = connect(
  state => ({
    userTwitch: state.core.twitch
  })
);

class Home extends React.Component {
  static propTypes = {
    userTwitch: PropTypes.object
  }

  static defaultProps = {
    userTwitch: null
  }

  renderLogin() {
    if (this.props.userTwitch) {
      return null;
    }
    return (
      <a href="/auth/twitch" target="_blank">
        <img alt="Connect to twitch" src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png" />
      </a>
    );
  }

  renderLogout() {
    if (!this.props.userTwitch) {
      return null;
    }
    return (
      <a href="/auth/twitch/logout" target="_blank">
        Exit
      </a>
    );
  }

  render() {
    return (
      <div className="home">
        <Route path="/services" component={Services} />
      </div>
    );
  }
}

export default hoc(Home);
