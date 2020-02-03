import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';
import AppConfig from '../../src/appConfig';
import <%=moduleNamePascal%> from '../../src/components/<%=moduleNamePascal%>';

configure({ adapter: new Adapter() });

describe('<%=moduleNamePascal%>', () => {
  it('default export should return a function', () => {
    expect(<%=moduleNamePascal%>).toBeInstanceOf(Function);
  });

  it('module should render correct JSX', () => {
    const renderedModule = shallow(<<%=moduleNamePascal%> />);
    expect(toJson(renderedModule)).toMatchSnapshot();
  });

  // test only necessary for root modules
  it('appConfig should contain accurate csp', () => {
    expect(AppConfig.csp).toBeDefined();
    expect(typeof AppConfig.csp).toBe('string');
  });
});
