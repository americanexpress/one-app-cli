import fs from 'node:fs';
import path from 'node:path';
import { readPackageUpSync } from 'read-pkg-up';

function writeToModuleConfig(newData) {
  const { packageJson } = readPackageUpSync();
  const configPath = path.resolve(process.cwd(), 'build', packageJson.version, 'module-config.json');
  const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
  fs.writeFileSync(configPath, JSON.stringify({
    ...config,
    ...newData,
  }, null, 2));
}

export default writeToModuleConfig;
