import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleMenu } from '../actions';

const hoc = connect(
  ({ menuOpened }) => ({ menuOpened }),
  dispatch => ({
    actions: {
      toggleMenu: () => {
        dispatch(toggleMenu());
      }
    }
  })
);

const Menu = ({ actions }) => (
  <div className="menuWrap">
    <nav className="menuTop">
      <div className="logo"><span>Multistream Chat</span></div>
      <div className="iconList">
        <a href="#"><i className="fa fa-fw fa-github" /></a>
      </div>
    </nav>
    <nav className="menuSide">
      <Link to="/services" onClick={actions.toggleMenu}>Services</Link>
      <Link to="/channels" onClick={actions.toggleMenu}>Channels</Link>
      <Link to="/about" onClick={actions.toggleMenu}>About</Link>
    </nav>
  </div>
);

Menu.propTypes = {
  actions: PropTypes.shape({
    toggleMenu: PropTypes.func.isRequired
  }).isRequired
};

export default hoc(Menu);
