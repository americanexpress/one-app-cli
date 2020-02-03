import React from 'react';
import { Route } from '@americanexpress/one-app-router';
import appConfig from '../appConfig';

const <%=moduleNamePascal%> = () => (
  <div>
    <h1>Welcome to One App!</h1>
  </div>
);

// Read about childRoutes: https://github.com/americanexpress/one-app#routing
<%=moduleNamePascal%>.childRoutes = () => ([
  <Route path="/" />,
]);

// Read about appConfig: https://github.com/americanexpress/one-app#appconfig
if (!global.BROWSER) {
  <%=moduleNamePascal%>.appConfig = appConfig;
}

export default <%=moduleNamePascal%>;
