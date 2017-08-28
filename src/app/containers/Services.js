import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Popup from '../components/Popup';
import { logoutTwitch, logoutLiveEdu } from '../actions';

const hoc = connect(
  ({ menuOpened, core }) => ({ menuOpened, twitchUser: core.twitch, liveEduUser: core.liveedu }),
  dispatch => ({
    actions: {
      close: history => (
        () => {
          history.push('/');
        }
      ),
      logoutTwitch: () => { dispatch(logoutTwitch()); },
      logoutLiveEdu: () => { dispatch(logoutLiveEdu()); }
    }
  })
);

class Services extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      close: PropTypes.func.isRequired,
      logoutTwitch: PropTypes.func.isRequired,
      logoutLiveEdu: PropTypes.func.isRequired
    }).isRequired,
    history: PropTypes.object.isRequired,
    twitchUser: PropTypes.object,
    liveEduUser: PropTypes.object
  }

  static defaultProps = {
    twitchUser: null,
    liveEduUser: null
  }

  constructor(props) {
    super(props);
    this.onLiveEduLogoutClick = this.onLiveEduLogoutClick.bind(this);
    this.onTwitchLogoutClick = this.onTwitchLogoutClick.bind(this);
  }

  onTwitchLogoutClick(e) {
    e.preventDefault();
    this.props.actions.logoutTwitch();
  }

  onLiveEduLogoutClick(e) {
    e.preventDefault();
    this.props.actions.logoutLiveEdu();
  }

  renderTwitchLogin() {
    if (this.props.twitchUser) {
      return null;
    }
    return (
      <a href="/auth/twitch" className="authLink authLink--twitch">
        <i className="serviceLogo fa fa-twitch" />
        <h2 className="serviceTitle">Twitch Login</h2>
      </a>
    );
  }

  renderTwitchLogout() {
    if (!this.props.twitchUser) {
      return null;
    }
    return (
      <a href="/auth/twitch/logout" onClick={this.onTwitchLogoutClick} className="deauthLink deauthLink--twitch">
        <h4 className="serviceDetails">Logged as {this.props.twitchUser.display_name}</h4>
        <i className="serviceLogo fa fa-twitch" />
        <h2 className="serviceTitle">Twitch Disconnect</h2>
      </a>
    );
  }

  renderLiveEduLogin() {
    if (this.props.liveEduUser) {
      return null;
    }
    return (
      <a href="/auth/liveedu" className="authLink authLink--liveEdu">
        <i className="serviceLogo fa fa-code" />
        <h2 className="serviceTitle">LiveEdu Login</h2>
      </a>
    );
  }

  renderLiveEduLogout() {
    if (!this.props.liveEduUser) {
      return null;
    }
    return (
      <a href="/auth/liveedu/logout" onClick={this.onLiveEduLogoutClick} className="deauthLink deauthLink--liveEdu">
        <h4 className="serviceDetails">Logged as {this.props.liveEduUser.display_name}</h4>
        <i className="serviceLogo fa fa-code" />
        <h2 className="serviceTitle">LiveEdu Disconnect</h2>
      </a>
    );
  }

  render() {
    return (
      <Popup title="Available Services" closeAction={this.props.actions.close(this.props.history)}>
        <div className="services">
          <div className="services__item">
            { this.renderTwitchLogin() }
            { this.renderTwitchLogout() }
          </div>
          <div className="services__item">
            { this.renderLiveEduLogin() }
            { this.renderLiveEduLogout() }
          </div>
        </div>
      </Popup>
    );
  }
}

export default hoc(Services);
