import React from 'react';
import ModuleRoute from 'holocron-module-route';

const <%=moduleNamePascal%> = () => (
  <div>
    <h1>Welcome to One App!</h1>
  </div>
);

<%=moduleNamePascal%>.childRoutes = () => ([
  <ModuleRoute path="/" />,
]);

if (!global.BROWSER) {
  // eslint-disable-next-line global-require
  <%=moduleNamePascal%>.appConfig = require('../config').default;
}

export default <%=moduleNamePascal%>;
