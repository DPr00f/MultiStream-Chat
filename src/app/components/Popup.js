import React from 'react';
import PropTypes from 'prop-types';

const Popup = ({ children, title, closeAction }) => (
  <div className="popup">
    <div className="popup__background" onClick={closeAction} />
    <div className="popup__container">
      <a onClick={closeAction}><i className="popup__closeButton fa fa-close" /></a>
      <h1 className="popup__title">{title}</h1>
      <div className="popup__content">
        {children}
      </div>
    </div>
  </div>
);

Popup.propTypes = {
  children: PropTypes.any.isRequired,
  title: PropTypes.string.isRequired,
  closeAction: PropTypes.func.isRequired
};

export default Popup;
