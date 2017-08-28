import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Route from 'react-router-dom/Route';
import Services from './Services';
import XMPPChat from '../utils/XMPPChat';
import { liveEduJoinRoom } from '../actions';

const hoc = connect(
  state => ({
    userTwitch: state.core.twitch,
    userLiveEdu: state.core.liveedu
  }),
  dispatch => ({
    actions: {
      liveEduJoinRoom: roomName => {
        dispatch(liveEduJoinRoom(roomName));
      }
    }
  })
);

class Home extends React.Component {
  static propTypes = {
    userTwitch: PropTypes.object,
    userLiveEdu: PropTypes.object,
    actions: PropTypes.shape({
      liveEduJoinRoom: PropTypes.func.isRequired
    }).isRequired
  }

  static defaultProps = {
    userTwitch: null,
    userLiveEdu: null
  }

  constructor(props) {
    super(props);
    this.liveEduChat = undefined;
  }

  componentDidMount() {
    this.liveEduChat = new XMPPChat('liveEduChat');
    this.setupLiveEduChat();
  }

  setupLiveEduChat() {
    if (!this.props.userLiveEdu) {
      return;
    }
    this.liveEduChat.login({
      user: this.props.userLiveEdu,
      domain: 'chat.livecoding.tv',
      wsURL: 'wss://ws.www.liveedu.tv/chat/websocket',
      onConnect: () => {
        console.log('connected');
        this.props.actions.liveEduJoinRoom(this.props.userLiveEdu.name);
      }
    });
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
