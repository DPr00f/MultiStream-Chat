import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const hoc = connect();

class Home extends React.Component {
  render() {
    return (
      <div className="page">
        Hello
      </div>
    );
  }
}

export default hoc(Home);
