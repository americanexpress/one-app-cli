import React from 'react';
import { Route } from '@americanexpress/one-app-router';
import csp from '../csp';

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
  <%=moduleNamePascal%>.appConfig = {
    csp,
  };
}

export default <%=moduleNamePascal%>;
