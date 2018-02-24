import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import 'semantic-ui-css/semantic.min.css';
import { Card, Icon, Image, Menu, MenuItem, Modal, Header, Segment, Grid, Sidebar, Button, Checkbox } from 'semantic-ui-react'

class ImageModal extends Component {
  getImageUrl = () => {
    return this.props.getBaseApiUrl() + '/media/' + this.props.media_id + '/data';
  };
  render() {
    if (this.props.media_id) {
      return (
        <Modal size='large' basic={true} open={true}>
          <Modal.Header>Select a Photo</Modal.Header>
          <Modal.Content image>
            <Image wrapped size='big' src={this.getImageUrl()} />
            <Modal.Description>
              <Header>Default Profile Image</Header>
              <p>We've found the following gravatar image associated with your e-mail address.</p>
              <p>Is it okay to use this photo?</p>
            </Modal.Description>
          </Modal.Content>
        </Modal>
      );
    } else {
      return (null);
    }
  };
}


class PhotoIcon extends Component {
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
      <Icon bordered={true} onMouseOver={this.onMouseOver} onClick={this.props.onClick} name={this.getIconName()} color={this.getIconColor()}  circular />
    );
  }
}

class BackupIcon extends PhotoIcon {
  getIconColor = () => {
    if (this.props.active == 2) {
      return 'blue';
    } else if (this.props.active == 1) {
      return 'yellow';
    } else {
      return 'grey';
    }
  };
  getIconName = () => {
    return 'cloud';
  }
};

class EditIcon extends PhotoIcon {

  getIconName = () => {
    return 'edit';
  }

};


class HideIcon extends PhotoIcon {
  getIconName = () => {
    if (this.props.active == 2) {
      return 'hide';
    } else {
      return 'unhide';
    }
  }
  getIconColor = () => {
    if (this.props.active == 0) {
      return 'grey';
    } else if (this.props.active == 1) {
      return 'yellow';
    } else {
      return 'red';
    }
  }
}

class ExpandIcon extends PhotoIcon {
  getIconName = () => {
    return 'expand'
  }
}

class Photo extends Component {
  // Generic Photo Object.
  // Expects following props:
  // - year  - all date items should have this
  // - month - month/day objects require this
  // - day   - day objects require this
  // - id    - required for photo/sets
  // - type  - Must be one of YEAR/MONTH/DAY/SET/MEDIA

  state = {
    backup_state: 0,
    hidden_state: false,
    media_count: 0,
    name: ''
  };

  getBaseItemUrl = (id, type) => {
    if (type === 'media') {
      return this.props.getBaseApiUrl() + '/media/' + id;
    } else if (type === 'set') {
      return this.props.getBaseApiUrl() + '/sets/' + id;
    } else {
      return this.props.getBaseApiUrl() + '/date/' + id;
    }
  }

  componentWillMount() {
    this.getObjectDetails(this.props.id, this.props.type);
  };

  componentWillReceiveProps(nextProps) {
    this.getObjectDetails(nextProps.id, nextProps.type);
  }

  getObjectDetails = (id = null, type = null, callback = null) => {
    let get_url = this.getBaseItemUrl(id, type);
    if (this.props.show_hidden) {
      get_url += '?show_hidden=1';
    }

    fetch(get_url)
      .then(res => res.json())
      .then(res => {
        this.setState((previousState) => ({
          name: res.name,
          backup_state: res.backup_state,
          media_count: res.media_count,
          hidden_state: res.hidden_state,
          datetime: res.datetime
        }), (callback) => {
          if (callback) {
            callback();
          }
        });
      });
  };

  toggleBackup = () => {
    fetch(this.getBaseItemUrl(this.props.id, this.props.type) + '/backup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({show_hidden: this.props.show_hidden})
    })
    .then(() => {
      this.getObjectDetails(this.props.id, this.props.type);
    });
  }

  toggleHide = () => {
    console.log(JSON.stringify({show_hidden: this.props.show_hidden}));
    fetch(this.getBaseItemUrl(this.props.id, this.props.type) + '/hide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({show_hidden: this.props.show_hidden})
    })
    .then(() => {
      this.getObjectDetails(this.props.id, this.props.type, () => {
        this.props.updateObjectIds();
      });
    });
  }

  getThumbnailUrl = () => {
    let base_url = this.getBaseItemUrl(this.props.id, this.props.type) + '/thumbnail';
    if (this.props.show_hidden) {
      base_url += '?show_hidden=1';
    }
    return base_url;
  };

  getDescription = () => {
    return this.state.name;
  };

  getChildInformation = () => {
    if (this.props.type == 'media') {
      return this.state.datetime;
    }
    let media_count_text = '';
    // If item has photo children, show this in the information
    if (this.props.type != 'media' && this.state.media_count) {
      media_count_text = ' (' + this.state.media_count + ' photos)';
    }
    return media_count_text;
  };

  onClick = () => {
    this.props.updateSelected(this.props.type, this.props.id)
  }

  getExpandIcon = () => {
    if (this.props.type == 'year' || this.props.type == 'month' || this.props.type === 'day') {
      return (<ExpandIcon onClick={this.expand} />);
    } else {
      return (null);
    }
  }

  expand = () => {
    this.props.updateSelected(this.props.type, this.props.id, true);
  }

  render() {
    return (
      <Segment style={{margin: '20px'}}>
        <Card>
          <Image style={{'object-fit': 'contain'}} onClick={this.onClick} src={this.getThumbnailUrl()} />
          <Card.Content>
            <Card.Header>{this.getDescription()}</Card.Header>
            <Card.Meta>{this.getChildInformation()}</Card.Meta>
          </Card.Content>
          <Card.Content extra>
            <EditIcon onClick={this.editName} />
            <BackupIcon onClick={this.toggleBackup} active={this.state.backup_state} />
            <HideIcon onClick={this.toggleHide} active={this.state.hidden_state} />
            {this.getExpandIcon()}
          </Card.Content>
        </Card>
      </Segment>
    );
  }
}

class PhotoViewer extends Component {

  render() {
    return (
      <Grid columns={6} doubling stackable>
      {this.props.shown_objects.map((obj_id) => <Photo getBaseApiUrl={this.props.getBaseApiUrl}
                                                  updateSelected={this.props.updateSelected}
                                                  type={this.props.shown_type}
                                                  id={obj_id}
                                                  updateObjectIds={this.props.updateObjectIds}
                                                  show_hidden={this.props.show_hidden} />)}
      </Grid>
    );
  };

};

class Breadcrumb extends Component {
  set_filter = () => {
    this.props.updateSelected(this.props.type, this.props.selected_value)
  }
  render() {
    if (this.props.selected_name) {
      return (
        <span>
          <div className="divider"> / </div>
          <a className="section" onClick={this.set_filter}>{this.props.selected_name}</a>
        </span>
      );
    } else {
      return (null);
    }
  }
}

class TopMenu extends Component {
  clear_filters = () => {
    this.props.updateSelected(null, null);
  }
  render() {
    return (
      <Menu>
      <MenuItem>
      <div className="ui breadcrumb">
        <Button onClick={this.props.toggleSideBar}>Show Filters</Button>
        <a onClick={this.clear_filters} className="selection">Root</a>
        <Breadcrumb type='year' updateSelected={this.props.updateSelected} selected_name={this.props.selected_year} selected_value={this.props.selected_year} />
        <Breadcrumb type='month' updateSelected={this.props.updateSelected} selected_name={this.props.selected_month} selected_value={this.props.selected_month} />
        <Breadcrumb type='day' updateSelected={this.props.updateSelected} selected_name={this.props.selected_day} selected_value={this.props.selected_day} />
        <Breadcrumb type='set' updateSelected={this.props.updateSelected} selected_name={this.props.selected_set} selected_value={this.props.selected_set} />
      </div>
      </MenuItem>
      </Menu>
    );
  };
}

class App extends Component {
  state = {
    expand_media: false,
    expand_sets: false,
    expand_days: false,
    expand_months: false,
    selected_year: null,
    selected_month: null,
    selected_day: null,
    selected_set: null,
    selected_media: null,
    shown_objects: [],
    shown_type: 'year',
    sidebar_visible: false,
    show_hidden: false,
    selected_id: null
  };

  convertDateToYMD = (date_id) => {

  }

  updateSelected = (type, id, show_date_media = false) => {

    this.setState((previousState) => {
      if (show_date_media) {
        previousState['shown_type'] = 'media';
      } else if (type == 'set') {
        previousState['shown_type'] = 'media';
      } else if (type === 'day') {
        previousState['selected_set'] = null;
        previousState['shown_type'] = 'set';
      } else if (type === 'month') {
        previousState['selected_set'] = null;
        previousState['selected_day'] = null;
        previousState['shown_type'] = 'day';
      } else if (type === 'year') {
        previousState['selected_set'] = null;
        previousState['selected_day'] = null;
        previousState['selected_month'] = null;
        previousState['shown_type'] = 'month';
      } else if (type === null) {
        previousState['selected_set'] = null;
        previousState['selected_day'] = null;
        previousState['selected_month'] = null;
        previousState['selected_year'] = null;
        previousState['shown_type'] = 'year';
      }

      previousState['selected_' + type] = id;
      previousState['selected_id'] = id;
      return previousState;
    }, () => {
      this.updateObjectIds(show_date_media);
    });
  }

  updateObjectIds = (show_date_media = false) => {
    let get_url = '';
    if (show_date_media === true) {
      get_url = '/date/' + this.state.selected_id + '/media';
    } else if (this.state.shown_type === 'year') {
      get_url = '/years';
    } else if (this.state.shown_type === 'month') {
      get_url = '/date/' + this.state.selected_year + '/months';
    } else if (this.state.shown_type === 'day') {
      get_url = '/date/' + this.state.selected_month + '/days';
    } else if (this.state.shown_type == 'set') {
      get_url = '/date/' + this.state.selected_day + '/sets';
    } else if (this.state.shown_type == 'media') {
      get_url = '/sets/' + this.state.selected_set + '/media';
    }
    // Add get parameter to show hidden objects, if the option has been selected.
    if (this.state.show_hidden) {
      get_url += '?show_hidden=1'
    }
    fetch(this.getBaseApiUrl() + get_url)
      .then(res => res.json())
      .then(res => {
        // Update state for shown objects with response from API
        this.setState(() => ({
          shown_objects: res
        }), () => {
          // Descend into object, if it's the only one
          this.checkEmptyContainer();
        });
      });
  };

  checkEmptyContainer = () => {
    // If only one object is on display, automatically
    // descend into it, if it's a month, day or set
    if (this.state.shown_objects.length === 1 && ['month', 'day', 'set'].indexOf(this.state.shown_type) !== -1) {
      this.updateSelected(this.state.shown_type, this.state.shown_objects[0]);
    }
  };

  componentWillMount() {
    this.updateObjectIds();
  };

  getBaseApiUrl = () => { return 'http://localhost:5000' };

  toggleSideBar = () => this.setState({ sidebar_visible: !this.state.sidebar_visible });
  toggleShowHidden = () => {
    this.setState({ show_hidden: !this.state.show_hidden }, () => {
      this.updateObjectIds();
    });
  };

  render() {
    return (
      <div>
        <TopMenu updateSelected={this.updateSelected}
          selected_year={this.state.selected_year}
          selected_month={this.state.selected_month}
          selected_day={this.state.selected_day}
          selected_set={this.state.selected_set}
          getBaseApiUrl={this.getBaseApiUrl}
          toggleSideBar={this.toggleSideBar} />

        <Sidebar.Pushable as={Segment}>
          <Sidebar as={Menu} animation='overlay' style={{'background-color': 'white'}} width='thin' visible={this.state.sidebar_visible} icon='labeled' vertical inverted>
            <Menu.Item name='home'>
              <Checkbox onChange={this.toggleShowHidden} value={this.state.show_hidden} label='Show hidden' />
            </Menu.Item>
          </Sidebar>
          <Sidebar.Pusher>
            <PhotoViewer updateSelected={this.updateSelected}
              updateObjectIds={this.updateObjectIds}
              selected_date={this.state.selected_date}
              selected_set={this.state.selected_set}
              shown_objects={this.state.shown_objects}
              shown_type={this.state.shown_type}
              getBaseApiUrl={this.getBaseApiUrl}
              show_hidden={this.state.show_hidden} />
          </Sidebar.Pusher>
        </Sidebar.Pushable>

        <ImageModal media_id={this.state.selected_media} getBaseApiUrl={this.getBaseApiUrl} />
      </div>
    );
  }
}

export default App;
