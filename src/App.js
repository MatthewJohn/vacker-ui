import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import 'semantic-ui-css/semantic.min.css';
import { Card, Icon, Image } from 'semantic-ui-react'


class PhotoIcon extends Component {
  state = {
    active: false
  };

  // Default methods to be overriden
  getIconName = () => {
    return 'search';
  };
  getIconColor = () => {
    return 'grey';
  };
  onClick = () => {
    return;
  };

  onMouseOver = () => {
    return;
  };

  render() {
    return (
      <Icon bordered={true} onMouseOver={this.onMouseOver} onClick={this.onClick} name={this.getIconName()} color={this.getIconColor()} circular />
    );
  }
}

class BackupIcon extends PhotoIcon {
  getIconColor = () => {
    if (this.state.active) {
      return 'blue';
    } else {
      return 'grey';
    }
  };
  getIconName = () => {
    return 'cloud'
  }
  onClick = () => {
    this.setState((previousState) => ({
      active: !(this.state.active)
    }))
  };
};

class EditIcon extends PhotoIcon {

  getIconName = () => {
    return 'edit';
  }

};


class HideIcon extends PhotoIcon {
  getIconName = () => {
    if (this.state.active) {
      return 'hide';
    } else {
      return 'unhide'
    }
  }
  onClick = () => {
    this.setState((previousState) => ({
      active: !(this.state.active)
    }))
  };
}

class ExpandIcon extends PhotoIcon {
  getIconName = () => {
    return 'expand'
  }
}

class Photo extends Component {
  state = {
    backup_state: false,
    hide_state: false
  };

  getThumbnailUrl = () => {
    if (this.props.type == 'MEDIA') {
      return this.props.getBaseApiUrl() + '/thumbnail/' + this.props.id;
    } else {
      return 'unknowntype'
    }
  };

  getDescription = () => {
    return 'me'
  };

  getChildInformation = () => {
    return '3 Snaps'
  };

  toggleHide = () => {
    this.setState((previousState) => ({
      hide_state: !(previousState.hide_state)
    }));
  };

  getHideIcon = () => {
    if (this.state.hide_state) {
      return 'unhide'
    } else {
      return 'hide'
    }
  };

  render() {
    return (
      <Card>
        <Image src={this.getThumbnailUrl()} />
        <Card.Content>
          <Card.Header>{this.getDescription()}</Card.Header>
          <Card.Meta>{this.getChildInformation()}</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <EditIcon />
          <BackupIcon />
          <HideIcon />
          <ExpandIcon />
        </Card.Content>
      </Card>
    );
  }
}


class App extends Component {
  getBaseApiUrl = () => {
    return 'http://localhost:5000'
  };
  render() {
    return (
      <Photo getBaseApiUrl={this.getBaseApiUrl} type='MEDIA' id='5a8c7c5155398e4d054fca72' />
    );
  }
}

export default App;
