import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';

import './App.css';
import Landing from './components/Landing';
import RepairPhone from './components/Repair';
import Device from './components/Device';
import Model from './components/Model';
import Color from './components/Color';
import ZipCode from './components/ZipCode';
import NoSupport from './components/NoSupport';
import Schedule from './components/Schedule';
import withTracker from './withTracker';

const App = props => {
  const { history } = props;

  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/repair/:device/:model/:color/zip-code/:zipcode/schedule" component={withTracker(Schedule)} />
        <Route path="/repair/:device/:model/:color/zip-code" component={withTracker(ZipCode)} />
        <Route path="/repair/:device/:model/:color" component={withTracker(Color)} />
        <Route path="/repair/:device/:model" component={withTracker(Model)} />
        <Route path="/repair/:device" component={withTracker(Device)} />
        <Route path="/repair" component={withTracker(RepairPhone)} />
        <Route path="/no-support" component={withTracker(NoSupport)} />
        <Route path="/" component={withTracker(Landing)} />
      </Switch>
    </ConnectedRouter>
  );
};

export default App;