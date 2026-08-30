import { existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';

const bundledServiceModules = join(__dirname, 'backend', 'node_modules');

if (existsSync(bundledServiceModules)) {
  process.env.NODE_PATH = [bundledServiceModules, process.env.NODE_PATH]
    .filter(Boolean)
    .join(delimiter);

  const NodeModule = require('node:module').Module as {
    _initPaths(): void;
  };
  NodeModule._initPaths();
}
