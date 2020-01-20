import React from 'react';
import ModuleRoute from 'holocron-module-route';
import csp from './csp';

const <%=moduleNamePascal%> = () => (
  <div>
    <h1>Welcome to One App!</h1>
  </div>
);

// read about childRoutes: https://github.com/americanexpress/one-app#routing
<%=moduleNamePascal%>.childRoutes = () => ([
  <ModuleRoute path="/" />,
]);

// read about appConfig: https://github.com/americanexpress/one-app#appconfig
if (!global.BROWSER) {
  <%=moduleNamePascal%>.appConfig = {
    csp
  }
}

export default <%=moduleNamePascal%>;
