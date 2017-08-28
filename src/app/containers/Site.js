import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const hoc = connect(
  state => ({
    menuOpened: state.menuOpened
  })
);

class Site extends React.Component {
  static propTypes = {
    menuOpened: PropTypes.bool,
    children: PropTypes.any.isRequired
  }

  static defaultProps = {
    menuOpened: false
  }

  render() {
    let className = 'siteContainer';
    if (this.props.menuOpened) {
      className += ' showMenu';
    }
    return (
      <div className={className}>
        { this.props.children }
      </div>
    );
  }
}

export default hoc(Site);
