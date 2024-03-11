// biome-ignore lint/nursery/noNodejsModules: this script is not run client-side
import fs from 'node:fs';
// biome-ignore lint/nursery/noNodejsModules: this script is not run client-side
import path from 'node:path';
import { packages } from '../workspace';

export type Package = {
  title: string;
  description: string;
  keywords: string[];
  // TODO https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependenciesmeta
  // peerDependencies?: {name: string, version: string, isOptional?: boolean}[];
  features?: { icon: string; text: string }[];
  roadmap?: { text: string; checked?: boolean; level?: number }[];
  examples?: { title: string; href: string }[];
};

export type Packages = Record<string, Package>;

const repoName = 'quintalwebsolutions/quintal-oss';
const githubRoot = `https://github.com/${repoName}`;
const shieldRoot = 'https://img.shields.io';
const shieldStyle = '?style=flat-square';

async function createDirIfNotExists(dir: string): Promise<boolean> {
  try {
    await fs.promises.access(dir, fs.constants.F_OK);
    return true;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      await fs.promises.mkdir(dir, { recursive: true });
      return false;
    }
    throw error;
  }
}

async function makeLabelerYml(rootDir: string): Promise<void> {
  const filePath = path.join(rootDir, '.github', 'labeler.yml');
  const content = Object.keys(packages).map((packageName) =>
    [
      `"@quintal/${packageName}":`,
      '  - changed-files:',
      `    - any-glob-to-any-file: packages/${packageName}/*`,
    ].join('\n'),
  );
  await fs.promises.writeFile(filePath, `${content.join('\n\n')}\n`);
}

async function makeCoverageYml(rootDir: string): Promise<void> {
  const filePath = path.join(rootDir, '.github', 'actions', 'collect_coverage', 'action.yml');

  const head = [
    'name: Collect coverage from all packages',
    '',
    'inputs:',
    '  token:',
    '    required: true',
    '',
    'runs:',
    '  using: composite',
    '  steps:',
  ];

  const content = Object.keys(packages).map((packageName) =>
    [
      `- name: Upload @quintal/${packageName} coverage to Codecov`,
      '  uses: codecov/codecov-action@v4',
      '  with:',
      '    fail_ci_if_error: true',
      `    file: ./packages/${packageName}/.coverage/coverage-final.json`,
      `    flags: ${packageName}`,
      '    token: ${{ inputs.token }}',
    ]
      .map((line) => ' '.repeat(4) + line)
      .join('\n'),
  );

  await fs.promises.writeFile(filePath, `${head.join('\n')}\n${content.join('\n\n')}\n`);
}

async function makeRootReadme(rootDir: string): Promise<void> {
  const filePath = path.join(rootDir, 'README.md');

  const content = [
    '# Quintal Open Source Software',
    '',
    `![Top language](${shieldRoot}/github/languages/top/quintalwebsolutions/quintal-oss${shieldStyle}&logo=typescript&logoColor=FAF9F8&labelColor=3178C6&color=3178C6)`,
    `[![Build status](${shieldRoot}/github/actions/workflow/status/${repoName}/release.yml${shieldStyle})](${githubRoot}/actions/workflows/release.yml)`,
    `[![Codacy grade](${shieldRoot}/codacy/grade/bb3b006255104e4da8b9a4a7793dcffe${shieldStyle}&logo=codacy)](https://app.codacy.com/gh/${repoName}dashboard)`,
    `[![Code coverage](${shieldRoot}/codecov/c/github/${repoName}${shieldStyle}&token=3ORY9UP6H7&logo=codecov)](https://codecov.io/gh/${repoName})`,
    `[![GitHub License](${shieldRoot}/github/license/${repoName}${shieldStyle})](${githubRoot}/blob/main/LICENSE)`,
    `[![Contributor Covenant](${shieldRoot}/badge/Contributor%20Covenant-2.1-4baaaa.svg${shieldStyle})](${githubRoot}/blob/main/CODE_OF_CONDUCT.md)`,
    `[![Pull requests welcome](${shieldRoot}/badge/PRs-welcome-brightgreen.svg${shieldStyle})](${githubRoot}/blob/main/CONTRIBUTING.md)`,
    '',
    'A package ecosystem dedicated to improving developer experience and type-safety in your next TypeScript project.',
    '',
    '## Packages',
    '',
    'name|version|description',
    '-|-|-',
    ...Object.entries(packages).map(
      ([n, p]) =>
        `\`@quintal/${n}\`|[![npm version](https://img.shields.io/npm/v/@quintal/${n}.svg?style=flat-square)](https://www.npmjs.com/package/@quintal/${n})|${p.description}`,
    ),
    '',
    '## Contributing to the project',
    '',
    `The Quintal package ecosystem is open for contributions! Please read the [contributing guide](${githubRoot}/blob/main/CONTRIBUTING.md) for more details.`,
    '',
    '## Support us',
    '',
    "If you or the company you work at has found value in using one or more of our packages, please consider supporting us through GitHub Sponsors. This way, you're directly empowering us to fulfill our cause of improving developer experience and type-safety in the TypeScript community's day-to-day coding practices!",
    '',
  ];

  await fs.promises.writeFile(filePath, `${content.join('\n')}\n`);
}

async function makePackageReadme(packageDir: string, name: string, p: Package): Promise<void> {
  const filePath = path.join(packageDir, 'README.md');
  const readmeEndMarker =
    '<!-- END AUTO-GENERATED: Add custom documentation after this comment -->';
  const readme = await fs.promises.readFile(filePath, 'utf-8').catch(() => '');
  const readmeContent = readme.substring(readme.indexOf(readmeEndMarker) + readmeEndMarker.length);

  const packageName = `@quintal/${name}`;
  const uriPackageName = encodeURIComponent(packageName);

  const makeListSection = <T>(
    arr: T[] | undefined,
    title: string,
    makeItem: (item: T, index: number) => string,
  ) => (arr && arr.length > 0 ? [`## ${title}`, '', ...arr.map(makeItem), ''] : []);

  const readmeHead = [
    // Title
    `# ${p.title}`,
    '',

    // Badges
    `[![NPM version](${shieldRoot}/npm/v/${packageName}${shieldStyle})](https://npmjs.com/${packageName})`,
    `[![NPM downloads](${shieldRoot}/npm/dt/${packageName}${shieldStyle})](https://npmjs.com/${packageName})`,
    `[![License](${shieldRoot}/npm/l/${packageName}${shieldStyle})](${githubRoot}/blob/main/LICENSE)`,
    `[![Bundle size](${shieldRoot}/bundlephobia/minzip/${packageName}${shieldStyle})](https://bundlephobia.com/package/${packageName})`,
    `[![Dependencies](${shieldRoot}/librariesio/release/npm/${packageName}${shieldStyle})](https://libraries.io/npm/${uriPackageName}/)`,
    `[![Code coverage](${shieldRoot}/codecov/c/github/${repoName}${shieldStyle}&token=3ORY9UP6H7&flag=${name}&logo=codecov)](https://codecov.io/gh/${repoName})`,
    `[![Pull requests welcome](${shieldRoot}/badge/PRs-welcome-brightgreen.svg${shieldStyle})](${githubRoot}/blob/main/CONTRIBUTING.md)`,
    '',

    // Description
    p.description,
    '',

    // Features
    ...makeListSection(
      p.features,
      'Features',
      ({ icon, text }, i) => `- ${icon} ${text}${i + 1 === p.features?.length ? '.' : ','}`,
    ),

    // Tsdocs
    `You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/${packageName})`,
    '',

    // Roadmap
    ...makeListSection(
      p.roadmap,
      'Roadmap',
      ({ level: l, checked: c, text: t }) => `${' '.repeat((l ?? 0) * 2)}- [${c ? 'x' : ' '}] ${t}`,
    ),

    // Table of Contents
    '## Table of Contents',
    '',
    '- [Getting Started](#getting-started)',
    ...(p.examples && p.examples.length > 0 ? ['- [Examples](#examples)'] : []),
    ...(readmeContent.match(/^#+ .+/gm)?.map((header) => {
      const level = (header.match(/^#+/g)?.[0].length ?? 2) - 2;
      const text = header.replace(/^#+ /, '');
      if (level < 0) return '';
      return `${' '.repeat(level * 2)}- [${text}](#${text.toLowerCase().replace(/\s+/g, '-')})`;
    }) ?? []),
    '',

    // Getting Started
    '## Getting Started',
    '',
    '```sh',
    `pnpm add ${packageName}`,
    '# or',
    `bun add ${packageName}`,
    '# or',
    `yarn add ${packageName}`,
    '# or',
    `npm install ${packageName}`,
    '```',

    // Examples
    ...makeListSection(
      p.examples,
      'Examples',
      (example) => `- [${example.title}](${example.href})`,
    ),
    '',
  ];

  await fs.promises.writeFile(filePath, readmeHead.join('\n') + readmeEndMarker + readmeContent);
}

async function makePackageJson(packageDir: string, name: string, p: Package): Promise<void> {
  const filePath = path.join(packageDir, 'package.json');
  const packageJson = JSON.parse(await fs.promises.readFile(filePath, 'utf-8').catch(() => '{}'));

  const content = {
    name: `@quintal/${name}`,
    version: packageJson.version ?? '0.0.0',
    license: 'MIT',
    description: p.description,
    keywords: p.keywords,
    author: {
      name: 'William Ford',
      email: 'william@quintalwebsolutions.com',
      url: 'https://quintalwebsolutions.com',
    },
    repository: {
      type: 'git',
      url: `${githubRoot}.git`,
      directory: `packages/${name}`,
    },
    homepage: `${githubRoot}/tree/main/packages/${name}#readme`,
    bugs: `${githubRoot}/labels/%40quintal%2F${name}`,
    main: './.dist/index.cjs',
    module: './.dist/index.mjs',
    types: './.dist/index.d.ts',
    files: ['.dist'],
    scripts: {
      build: 'run-s build:*',
      'build:clean': 'shx rm -rf .dist',
      'build:code': 'vite build',
      clean: 'shx rm -rf .config .coverage .coverage-ts .dist .docs .turbo node_modules',
      dev: 'vitest --watch',
      lint: 'pnpm lint:fix && pnpm lint:types',
      'lint:check': 'biome ci .',
      'lint:fix': 'biome check --apply .',
      'lint:types': 'tsc --noEmit',
      test: 'run-s test:*',
      'test:source': 'vitest',
      'test:types': 'typescript-coverage-report --outputDir .coverage-ts --strict',
    },
    peerDependencies: packageJson?.peerDependencies,
    dependencies: packageJson?.dependencies,
    devDependencies: packageJson?.devDependencies,
  };

  await fs.promises.writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`);
}

async function makePackage(packageDir: string, name: string, p: Package): Promise<void> {
  const dirExists = await createDirIfNotExists(packageDir);

  await makePackageJson(packageDir, name, p);
  await makePackageReadme(packageDir, name, p);

  if (dirExists) return;

  const srcDir = path.join(packageDir, 'src');
  const srcExists = await createDirIfNotExists(srcDir);

  const testsDir = path.join(packageDir, 'tests');
  const testsExists = await createDirIfNotExists(testsDir);

  if (!(srcExists || testsExists)) {
    await fs.promises.writeFile(
      path.join(srcDir, 'index.ts'),
      'export const add = (a: number, b: number): number => {\n  return a + b;\n};\n',
    );
    await fs.promises.writeFile(
      path.join(testsDir, 'index.spec.ts'),
      "import { describe, expect, it } from 'vitest';\nimport { add } from '../src';\n\ndescribe('add', () => {\n  it('adds integers', () => {\n    expect(add(1, 2)).toBe(3);\n  });\n});\n",
    );
  }
}

async function main(): Promise<void> {
  const rootDir = path.join(__dirname, '..');

  await Promise.all([
    makeRootReadme(rootDir),
    makeLabelerYml(rootDir),
    makeCoverageYml(rootDir),
    ...Object.entries(packages).map(([name, p]) =>
      makePackage(path.join(rootDir, 'packages', name), name, p),
    ),
  ]);
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
