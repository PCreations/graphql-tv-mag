/* @flow */
/* eslint-disable global-require */

import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import ReactHotLoader from './components/ReactHotLoader';
import injectTapEventPlugin from 'react-tap-event-plugin';

import App from '../shared/universal/components/App';
import theme from '../shared/universal/components/App/theme';

// Get the DOM Element that will host our React application.
const container = document.querySelector('#app');

injectTapEventPlugin();

function renderApp(TheApp) {
  render(
    <ReactHotLoader>
      <BrowserRouter>
        <TheApp muiTheme={theme(navigator.userAgent)}/>
      </BrowserRouter>
    </ReactHotLoader>,
    container
  );
}

// The following is needed so that we can support hot reloading our application.
if (process.env.NODE_ENV === 'development' && module.hot) {
  // Accept changes to this file for hot reloading.
  module.hot.accept('./index.js');
  // Any changes to our App will cause a hotload re-render.
  module.hot.accept(
    '../shared/universal/components/App',
    () => renderApp(require('../shared/universal/components/App').default)
  );
}

renderApp(App);
