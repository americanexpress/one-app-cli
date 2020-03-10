import React from 'react';
import { shallow } from 'enzyme';
import <%=moduleNamePascal%> from '../../src/components/<%=moduleNamePascal%>';

describe('<%=moduleNamePascal%> should render as expected', () => {
  it('module should render correct JSX', () => {
    const renderedModule = shallow(<<%=moduleNamePascal%> />);
    expect(renderedModule.find('div')).toMatchSnapshot();
  });
});
