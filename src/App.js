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
    return 'cloud'
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
      return 'unhide'
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

  getBaseItemUrl = (id, type, selected_year, selected_month) => {
    console.log(id, type, selected_year, selected_month);
    if (type === 'media') {
      return this.props.getBaseApiUrl() + '/media/' + id;
    } else if (type === 'set') {
      return this.props.getBaseApiUrl() + '/sets/' + id;
    } else if (type === 'year') {
      return this.props.getBaseApiUrl() + '/years/' + id;
    } else if (type === 'month') {
      return this.props.getBaseApiUrl() + '/years/' + selected_year + '/months/' + id;
    } else if (type === 'day') {
      return this.props.getBaseApiUrl() + '/years/' + selected_year + '/months/' + selected_month + '/days/' + id;
    }
  }

  componentWillMount() {
    this.getObjectDetails(this.props.id, this.props.type, this.props.selected_year, this.props.selected_month);
  };

  componentWillReceiveProps(nextProps) {
    this.getObjectDetails(nextProps.id, nextProps.type, nextProps.selected_year, nextProps.selected_month);
  }

  getObjectDetails = (id = null, type = null, selected_year = null, selected_month = null) => {
    // if (id === null && type === null && selected_year === null && selected_month === null) {
    //   id = this.props.id;
    //   type = this.props.type;
    //   selected_year = this.props.selected_year;
    //   selected_month = this.props.selected_month;
    // }
    let get_url = this.getBaseItemUrl(id, type, selected_year, selected_month);
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
          hidden_state: res.hidden_state
        }));
        console.log(res.hidden_state);
      });
  };

  toggleBackup = () => {
    fetch(this.getBaseItemUrl(this.props.id, this.props.type, this.props.selected_year, this.props.selected_month) + '/backup', {
      method: 'POST'
    })
    .then(() => {
      this.getObjectDetails(this.props.id, this.props.type, this.props.selected_year, this.props.selected_month);
    });
  }

  toggleHide = () => {
    fetch(this.getBaseItemUrl(this.props.id, this.props.type, this.props.selected_year, this.props.selected_month) + '/hide', {
      method: 'POST'
    })
    .then(() => {
      this.props.updateObjectIds();
    });
  }

  getThumbnailUrl = () => {
    return this.getBaseItemUrl(this.props.id, this.props.type, this.props.selected_year, this.props.selected_month) + '/thumbnail';
  };

  getDescription = () => {
    return this.state.name;
  };

  getChildInformation = () => {
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

  render() {
    return (
      <Segment style={{margin: '20px'}}>
        <Card>
          <Image onClick={this.onClick} src={this.getThumbnailUrl()} />
          <Card.Content>
            <Card.Header>{this.getDescription()}</Card.Header>
            <Card.Meta>{this.getChildInformation()}</Card.Meta>
          </Card.Content>
          <Card.Content extra>
            <EditIcon onClick={this.editName} />
            <BackupIcon onClick={this.toggleBackup} active={this.state.backup_state} />
            <HideIcon onClick={this.toggleHide} active={this.state.hidden_state} />
            <ExpandIcon onClick={this.expand} />
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
                                                  selected_year={this.props.selected_year}
                                                  selected_month={this.props.selected_month}
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
    show_hidden: false
  };

  updateSelected = (type, id) => {

    this.setState((previousState) => {
      if (type == 'set') {
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
      return previousState;
    }, () => {
      this.updateObjectIds();
    });
  }

  updateObjectIds = () => {
    let get_url = '';
    if (this.state.shown_type === 'year') {
      get_url = '/years';
    } else if (this.state.shown_type === 'month') {
      get_url = '/years/' + this.state.selected_year + '/months';
    } else if (this.state.shown_type === 'day') {
      get_url = '/years/' + this.state.selected_year + '/months/' + this.state.selected_month + '/days';
    } else if (this.state.shown_type == 'set') {
      get_url = '/years/' + this.state.selected_year + '/months/' + this.state.selected_month + '/days/' + this.state.selected_day + '/sets';
    } else if (this.state.shown_type == 'media') {
      get_url = '/sets/' + this.state.selected_set + '/media';
    }
    if (this.state.show_hidden) {
      get_url += '?show_hidden=1'
    }
    console.log(get_url);
    fetch(this.getBaseApiUrl() + get_url)
      .then(res => res.json())
      .then(res => {
        console.log(res);
        this.setState(() => ({
          shown_objects: res
        }));
      });
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
              selected_year={this.state.selected_year}
              selected_month={this.state.selected_month}
              selected_day={this.state.selected_day}
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
