const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const backendRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(
  backendRoot,
  'src/questions/sat-reading-writing.questions.official.ts',
);
const compiledPath = path.join(
  backendRoot,
  'dist/questions/sat-reading-writing.questions.official.js',
);
const outputPath = path.resolve(backendRoot, '../official-questions.json');

if (!fs.existsSync(sourcePath)) {
  console.error(
    'Cannot export questions: the private official-question source file is missing.',
  );
  process.exit(1);
}

execFileSync(
  process.execPath,
  [require.resolve('typescript/lib/tsc.js'), '-p', 'tsconfig.json'],
  { cwd: backendRoot, stdio: 'inherit' },
);

delete require.cache[require.resolve(compiledPath)];
const privateModule = require(compiledPath);
if (!Array.isArray(privateModule.OFFICIAL_QUESTIONS)) {
  throw new TypeError(
    'The private question module must export OFFICIAL_QUESTIONS as an array.',
  );
}

fs.writeFileSync(
  outputPath,
  `${JSON.stringify(privateModule.OFFICIAL_QUESTIONS, null, 2)}\n`,
);
console.log(`Exported ${privateModule.OFFICIAL_QUESTIONS.length} questions.`);
