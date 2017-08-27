import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const hoc = connect();

class Home extends React.Component {
  render() {
    return (
      <div className="page">
        <a href="/auth/twitch" target="_blank">
          <img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png" />
        </a>
      </div>
    );
  }
}

export default hoc(Home);
