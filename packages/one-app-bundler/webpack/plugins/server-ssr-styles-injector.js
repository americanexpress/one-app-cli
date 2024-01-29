import fs from 'node:fs';
import { emptyAggregatedStyles, getAggregatedStyles } from '@americanexpress/one-app-dev-bundler';
import { stylesPlaceholderUUID } from '../loaders/index-server-ssr-styles-placeholder-loader.js';

class ServerSsrStylesInjectorPlugin {
  // eslint-disable-next-line class-methods-use-this -- no need for this
  apply(compiler) {
    compiler.hooks.assetEmitted.tap('ServerSsrStylesInjectorPlugin', async (file, { targetPath }) => {
      if (targetPath.endsWith('.node.js')) {
        console.log('here');
        const initialContent = await fs.promises.readFile(targetPath, 'utf8');

        const outputContent = initialContent.replace(`'${stylesPlaceholderUUID}'`, `{
    aggregatedStyles: ${getAggregatedStyles()},
    getFullSheet: function getFullSheet() {
return this.aggregatedStyles.reduce((acc, { css }) => acc + css, '');
},
  };`);
        await fs.promises.writeFile(targetPath, outputContent, 'utf8');
        emptyAggregatedStyles();
      }
    });
  }
}

export default ServerSsrStylesInjectorPlugin;
