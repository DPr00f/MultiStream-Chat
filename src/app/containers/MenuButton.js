import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toggleMenu } from '../actions';

const hoc = connect(
  null,
  dispatch => ({
    actions: {
      toggleMenu: () => {
        dispatch(toggleMenu());
      }
    }
  })
);

const MenuButton = ({ actions }) => (
  <button className="menuButton" onClick={actions.toggleMenu} />
);

MenuButton.propTypes = {
  actions: PropTypes.shape({
    toggleMenu: PropTypes.func.isRequired
  }).isRequired
};

export default hoc(MenuButton);
