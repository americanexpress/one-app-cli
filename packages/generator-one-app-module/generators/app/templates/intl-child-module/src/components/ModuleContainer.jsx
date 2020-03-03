import React from 'react';
import PropTypes from 'prop-types';
import { loadLanguagePack, updateLocale } from '@americanexpress/one-app-ducks';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { holocronModule } from 'holocron';
import { fromJS } from 'immutable';

export const <%=moduleNamePascal%> = ({ switchLanguage, languageData, localeName }) => {
  const locales = ['en-US', 'en-CA', 'es-MX'];
  // Read about loading async data: 
  // https://github.com/americanexpress/one-app/blob/master/docs/api/modules/Loading-Data.md
  // quick and dirty solution - implement based on your use case
  if (languageData.greeting) {
    return (
      <IntlProvider locale={localeName} messages={languageData}>
        <div>
          <span id="greeting-message">
            <h1><FormattedMessage id="greeting" /></h1>
          </span>
          <div id="locale">
            <label htmlFor="locale-selector">
              <p>Choose a locale:</p>
              <select name="locale" id="locale-selector" onChange={switchLanguage}>
                {locales.map((locale) => <option key={locale} value={locale}>{locale}</option>
                )}
              </select>
            </label>
          </div>
        </div>
      </IntlProvider>
    );
  }
  return null;
};

<%=moduleNamePascal%>.propTypes = {
  switchLanguage: PropTypes.func.isRequired,
  languageData: PropTypes.shape({
    greeting: PropTypes.string.isRequired,
  }).isRequired,
  localeName: PropTypes.string.isRequired,
};

export const mapDispatchToProps = (dispatch) => ({
  switchLanguage: async ({ target }) => {
    await dispatch(updateLocale(target.value));
    await dispatch(loadLanguagePack('<%=modulePackageName%>', { fallbackLocale: 'en-US' }));
  },
});

export const mapStateToProps = (state) => {
  const localeName = state.getIn(['intl', 'activeLocale']);
  const languagePack = state.getIn(
    ['intl', 'languagePacks', localeName, '<%=modulePackageName%>'],
    fromJS({})
  ).toJS();

  return {
    languageData: languagePack && languagePack.data ? languagePack.data : {},
    localeName,
  };
};

export const load = () => (dispatch) => dispatch(loadLanguagePack('<%=modulePackageName%>', { fallbackLocale: 'en-US' }));

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  holocronModule({
    name: '<%=modulePackageName%>',
    load,
  })
)(<%=moduleNamePascal%>);
