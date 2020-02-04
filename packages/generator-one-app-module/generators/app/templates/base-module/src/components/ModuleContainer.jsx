import React from 'react';
import { Route } from '@americanexpress/one-app-router';

const <%=moduleNamePascal%> = () => (
  <div>
    <h1>Welcome to One App!</h1>
  </div>
);

// Read about childRoutes:
// https://github.com/americanexpress/one-app/blob/master/docs/api/modules/Routing.md#childroutes
<%=moduleNamePascal%>.childRoutes = () => ([
  <Route path="/" />,
]);

// Read about appConfig:
// https://github.com/americanexpress/one-app/blob/master/docs/api/modules/App-Configuration.md
if (!global.BROWSER) {
  // eslint-disable-next-line global-require
  <%=moduleNamePascal%>.appConfig = require('../appConfig').default;
}

export default <%=moduleNamePascal%>;
