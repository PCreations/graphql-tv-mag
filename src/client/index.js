/* @flow */
/* eslint-disable global-require */

import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import ReactHotLoader from './components/ReactHotLoader';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { Client } from 'subscriptions-transport-ws';
import { print } from 'graphql-tag/printer';

import { createLocalNetworkInterface } from '../shared/localNetworkInterface';
import configureStore from './configureStore'
import App from '../shared/universal/components/App';
import schema from '../shared/schema';


const wsClient = new Client('ws://localhost:8080');

// quick way to add the subscribe and unsubscribe functions to the network interface
const addGraphQLSubscriptions = (networkInterface, wsClient) => Object.assign(networkInterface, {
  subscribe: (request, handler) => wsClient.subscribe({
    query: print(request.query),
    variables: request.variables,
  }, handler),
  unsubscribe: (id) => {
    wsClient.unsubscribe(id);
  },
});

// Get the DOM Element that will host our React application.
const container = document.querySelector('#app');

const networkInterface = createLocalNetworkInterface({ schema })

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
);

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  initialState: window.__APOLLO_STATE__
});

const store = configureStore(client.reducer())

if ('serviceWorker' in navigator) {
  // Your service-worker.js *must* be located at the top-level directory relative to your site.
  // It won't be able to control pages unless it's located at the same level or higher than them.
  // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
  // See https://github.com/slightlyoff/ServiceWorker/issues/468
  navigator.serviceWorker.register('react-universally-pwa.sw.js').then(function(reg) {
    // updatefound is fired if service-worker.js changes.
    reg.onupdatefound = function() {
      // The updatefound event implies that reg.installing is set; see
      // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
      var installingWorker = reg.installing;

      installingWorker.onstatechange = function() {
        switch (installingWorker.state) {
          case 'installed':
            if (navigator.serviceWorker.controller) {
              // At this point, the old content will have been purged and the fresh content will
              // have been added to the cache.
              // It's the perfect time to display a "New content is available; please refresh."
              // message in the page's interface.
              console.log('New or updated content is available.');
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a "Content is cached for offline use." message.
              console.log('Content is now available offline!');
            }
            break;

          case 'redundant':
            console.error('The installing service worker became redundant.');
            break;
        }
      };
    };
  }).catch(function(e) {
    console.error('Error during service worker registration:', e);
  });
}

injectTapEventPlugin();

function renderApp(TheApp) {
  render(
    <ReactHotLoader>
      <BrowserRouter>
        <ApolloProvider store={store} client={client}>
          <TheApp/>
        </ApolloProvider>
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
