import fs from 'node:fs';
import {
  validateAppConfig,
} from '@americanexpress/one-app-dev-bundler';

class RestrictRuntimeSymbols {
  // eslint-disable-next-line class-methods-use-this -- no need for this
  apply(compiler) {
    compiler.hooks.assetEmitted.tap('RestrictRuntimeSymbols', (file, { targetPath }) => {
      if (targetPath.endsWith('.node.js')) {
        const initialContent = fs.readFileSync(targetPath, 'utf8');
        if (initialContent.match(/create-react-class/)) {
          throw new Error('`create-react-class` is restricted from being used');
        }
      } else if (targetPath.endsWith('rowser.js')) { // catch browser and legacyBrowser
        const initialContent = fs.readFileSync(targetPath, 'utf8');

        if (initialContent.match(/create-react-class/)) {
          throw new Error('`create-react-class` is restricted from being used');
        }

        if (initialContent.match(/.appConfig/)) {
          const messages = [];
          validateAppConfig(initialContent).forEach((message) => messages.push(message));
          if (messages.length > 0) {
            throw new Error(`appConfig validation failed with the following messages: [ ${messages.join('/n,')} ]`);
          }
        }
      }
    });
  }
}

export default RestrictRuntimeSymbols;
