import fs from 'node:fs';
import { emptyAggregatedStyles, getAggregatedStyles } from '@americanexpress/one-app-dev-bundler';
import { stylesPlaceholderUUID } from '../loaders/index-server-ssr-styles-placeholder-loader.js';

class ServerSsrStylesInjectorPlugin {
  // eslint-disable-next-line class-methods-use-this -- no need for this
  apply(compiler) {
    compiler.hooks.assetEmitted.tap('ServerSsrStylesInjectorPlugin', (file, { targetPath }) => {
      if (targetPath.endsWith('.node.js')) {
        const initialContent = fs.readFileSync(targetPath, 'utf8');

        const replacementString = `{
  aggregatedStyles: ${getAggregatedStyles()},
  getFullSheet: function getFullSheet() {
    return this.aggregatedStyles.reduce((acc, { css }) => acc + css, '');
  },
};`;

        // replace both for `'` and `"` since the production bundler changes between those
        const outputContent = initialContent
          .replace(`'${stylesPlaceholderUUID}'`, replacementString)
          .replace(`"${stylesPlaceholderUUID}"`, replacementString);
        fs.writeFileSync(targetPath, outputContent, 'utf8');
        emptyAggregatedStyles();
      }
    });
  }
}

export default ServerSsrStylesInjectorPlugin;
