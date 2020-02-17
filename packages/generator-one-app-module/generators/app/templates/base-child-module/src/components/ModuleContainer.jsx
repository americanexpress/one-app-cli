import React from 'react';
import childRoutes from '../childRoutes';

const <%=moduleNamePascal%> = () => (
  <div>
    <h1>Welcome to One App!</h1>
  </div>
);

// Read about childRoutes:
// https://github.com/americanexpress/one-app/blob/master/docs/api/modules/Routing.md#childroutes
<%=moduleNamePascal%>.childRoutes = childRoutes;

export default <%=moduleNamePascal%>;
