import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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

class Page extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      toggleMenu: PropTypes.func.isRequired
    }).isRequired,
    menuOpened: PropTypes.bool.isRequired,
    children: PropTypes.any.isRequired
  };

  constructor(props) {
    super(props);
    this.onPageClick = this.onPageClick.bind(this);
  }

  onPageClick() {
    if (this.props.menuOpened) {
      this.props.actions.toggleMenu();
    }
  }

  render() {
    return (
      <div className="pageWrapper">
        <div className="page" onClick={this.onPageClick}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default hoc(Page);
