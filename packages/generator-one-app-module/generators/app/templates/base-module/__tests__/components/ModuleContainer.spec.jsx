import React from 'react';
import { shallow } from 'enzyme';
import { Route } from '@americanexpress/one-app-router';
import toJson from 'enzyme-to-json';
import AppConfig from '../../src/appConfig';
import childRoutes from '../../src/childRoutes';
import <%=moduleNamePascal%> from '../../src/components/<%=moduleNamePascal%>';

describe('<%=moduleNamePascal%>', () => {
  describe('appConfig', () => {
    // csp only necessary for root modules
      it('should contain accurate csp', () => {
        expect(AppConfig.csp).toBeDefined();
        expect(typeof AppConfig.csp).toBe('string');
      });
    });
  
    describe('childRoutes', () => {
      it('should return an array of Routes', () => {
        expect(childRoutes()).toEqual(expect.any(Array));
        childRoutes().forEach((route) => expect(route.type).toEqual(Route));
      });
    });
    it('module should render correct JSX', () => {
      const renderedModule = shallow(<<%=moduleNamePascal%> />);
      expect(renderedModule.find('div')).toMatchSnapshot();
    });
});
