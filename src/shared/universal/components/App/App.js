/* @flow */

import React from 'react';
import CSSModules from 'react-css-modules';
import { Match, Miss } from 'react-router';
import Helmet from 'react-helmet';
import CodeSplit from 'code-split-component';
import Error404 from './Error404';
import Header from './Header';
import { WEBSITE_TITLE, WEBSITE_DESCRIPTION } from '../../constants';
import styles from './app.css';

function App() {
  return (
    <div className={styles.container}>
      {/*
        All of the following will be injected into our page header.
        @see https://github.com/nfl/react-helmet
      */}
      <Helmet
        htmlAttributes={{ lang: 'en' }}
        titleTemplate={`${WEBSITE_TITLE} - %s`}
        defaultTitle={WEBSITE_TITLE}
        meta={[
          { name: 'description', content: WEBSITE_DESCRIPTION },
        ]}
        link={[{
          rel: 'stylesheet',
          type: 'text/css',
          href: '/globals.css'
        }]}
        script={[]}
      />

      <Header />

      <Match
        exactly
        pattern="/"
        render={routerProps =>
          <CodeSplit module={System.import('./Home')}>
            { Home => Home && <Home {...routerProps} /> }
          </CodeSplit>
        }
      />

      <Match
        pattern="/about"
        render={routerProps =>
          <CodeSplit module={System.import('./About')}>
            { About => About && <About {...routerProps} /> }
          </CodeSplit>
        }
      />

      <Miss component={Error404} />
    </div>
  );
}

export default CSSModules(App, styles);
