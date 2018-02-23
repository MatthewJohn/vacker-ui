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
      <Icon bordered={true} onMouseOver={this.onMouseOver} onClick={this.onClick} name={this.getIconName()} color={this.getIconColor()}  circular />
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
  // Generic Photo Object.
  // Expects following props:
  // - year  - all date items should have this
  // - month - month/day objects require this
  // - day   - day objects require this
  // - id    - required for photo/sets
  // - type  - Must be one of YEAR/MONTH/DAY/SET/MEDIA

  state = {
    backup_state: false,
    hide_state: false,
    photo_count: 0,
    name: ''
  };

  getBaseItemUrl = () => {
    if (this.props.type == 'media') {
      return this.props.getBaseApiUrl() + '/media/' + this.props.id;
    } else if (this.props.type == 'set') {
      return this.props.getBaseApiUrl() + '/sets/' + this.props.id;
    } else if (this.props.type == 'year') {
      return this.props.getBaseApiUrl() + '/years/' + this.props.id;
    } else if (this.props.type == 'month') {
      return this.props.getBaseApiUrl() + '/years/' + this.props.selected_year + '/months/' + this.props.id;
    } else if (this.props.type == 'day') {
      return this.props.getBaseApiUrl() + '/years/' + this.props.selected_year + '/months/' + this.props.selected_month + '/days/' + this.props.id;
    }
  }

  getThumbnailUrl = () => {
    console.log(this.getBaseItemUrl() + '/thumbnail');
    return this.getBaseItemUrl() + '/thumbnail';
  };

  getDescription = () => {
    return this.state.name;
  };

  getChildInformation = () => {
    let photo_count_text = '';
    // If item has photo children, show this in the information
    if (this.props.type != 'media' && this.state.photo_count) {
      photo_count_text = ' (' + this.state.photo_count + ' photos)';
    }
    return photo_count_text;
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

  onClick = () => {
    this.props.updateSelected(this.props.type, this.props.id)
  }

  render() {
    return (
      <div className="ui segment" style={{margin: '20px'}}>
        <Card>
          <Image onClick={this.onClick} src={this.getThumbnailUrl()} />
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
      </div>
    );
  }
}

class PhotoViewer extends Component {

  render() {
    return (
      <div className="ui three column doubling stackable grid container">
      {this.props.shown_objects.map((obj_id) => <Photo getBaseApiUrl={this.props.getBaseApiUrl}
                                                  updateSelected={this.props.updateSelected}
                                                  type={this.props.shown_type}
                                                  id={obj_id}
                                                  selected_year={this.props.selected_year}
                                                  selected_month={this.props.selected_month} />)}
      </div>
    );
  };

};

class Breadcrumb extends Component {
  render() {
    if (this.props.selected_name) {
      if (this.props.type == 'year') {
        return (<a className="section">{this.props.selected_name}</a>);
      } else {
        return (
          <div>
            <div className="divider"> / </div>
            <a className="section">{this.props.selected_name}</a>
          </div>
        );
      }
    } else {
      return (<div></div>);
    }
  }
}

class TopMenu extends Component {
  render() {
    return (
      <div className="ui breadcrumb">
        <Breadcrumb type='year' selected_name={this.props.selected_year} />
        <Breadcrumb type='month' selected_name={this.props.selected_month} />
        <Breadcrumb type='day' selected_name={this.props.selected_day} />
        <Breadcrumb type='set' selected_name={this.props.selected_set} />
      </div>
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
    shown_objects: [],
    shown_type: 'year'
  };

  updateSelected = (type, id) => {

    this.setState((previousState) => {
      if (type == 'day') {
        previousState['selected_set'] = null;
        previousState['shown_type'] = 'set';
      }
      if (type == 'month') {
        previousState['selected_set'] = null;
        previousState['selected_day'] = null;
        previousState['shown_type'] = 'day';
      }
      if (type == 'year') {
        previousState['selected_set'] = null;
        previousState['selected_day'] = null;
        previousState['selected_month'] = null;
        previousState['shown_type'] = 'month';
      }
      previousState['selected_' + type] = id;
      return previousState;
    }, () => {
      this.updateObjectIds();
    });
  }

  updateObjectIds = () => {
    let get_url = '';
    if (this.state.shown_type == 'year') {
      get_url = '/years'
    } else if (this.state.shown_type == 'month') {
      get_url = '/years/' + this.state.selected_year + '/months'
    }
    fetch(this.getBaseApiUrl() + get_url)
      .then(res => res.json())
      .then(res => {
        this.setState(() => ({
          shown_objects: res
        }));
        console.log('updated objects: ' + this.state.shown_type);
      });
  };

  componentWillMount() {
    this.updateObjectIds();
  };

  getBaseApiUrl = () => {
    return 'http://localhost:5000'
  };

  render() {
    return (
      <div>
        <TopMenu updateSelected={this.updateSelected}
          selected_year={this.state.selected_year}
          selected_month={this.state.selected_month}
          selected_day={this.state.selected_day}
          selected_set={this.state.selected_set}
          getBaseApiUrl={this.getBaseApiUrl} />
        <PhotoViewer updateSelected={this.updateSelected}
          selected_year={this.state.selected_year}
          selected_month={this.state.selected_month}
          selected_day={this.state.selected_day}
          selected_set={this.state.selected_set}
          shown_objects={this.state.shown_objects}
          shown_type={this.state.shown_type}
          getBaseApiUrl={this.getBaseApiUrl} />
      </div>
    );
  }
}

export default App;
