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

async function makePackageReadme(packageDir: string, name: string, p: Package): Promise<void> {
  const filePath = path.join(packageDir, 'README.md');
  const readmeEndMarker =
    '<!-- END AUTO-GENERATED: Add custom documentation after this comment -->';
  const readme = await fs.promises.readFile(filePath, 'utf-8').catch(() => '');
  const readmeContent = readme.substring(readme.indexOf(readmeEndMarker) + readmeEndMarker.length);

  const packageName = `@quintal/${name}`;
  const uriPackageName = encodeURIComponent(packageName);
  const shieldsRoot = 'https://img.shields.io';
  const style = '?style=flat-square';

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
    `[![NPM version](${shieldsRoot}/npm/v/${packageName}${style})](https://npmjs.com/${packageName})`,
    `[![NPM downloads](${shieldsRoot}/npm/dt/${packageName}${style})](https://npmjs.com/${packageName})`,
    `[![License](${shieldsRoot}/npm/l/${packageName}${style})](https://github.com/quintalwebsolutions/quintal-oss/blob/main/LICENSE)`,
    `[![Bundle size](${shieldsRoot}/bundlephobia/minzip/${packageName}${style})](https://bundlephobia.com/package/${packageName})`,
    `[![Dependencies](${shieldsRoot}/librariesio/release/npm/${packageName}${style})](https://libraries.io/npm/${uriPackageName}/)`,
    // TODO
    // `[![Code coverage](${shieldsRoot}/codecov/c/github${repo}${style}&flag=${name}&logo=codecov&token=62N8FTE2CV)](https://codecov.io/gh/saphewilliam/saphe-packages)`,
    `[![Pull requests welcome](${shieldsRoot}/badge/PRs-welcome-brightgreen.svg${style})](https://github.com/quintalwebsolutions/quintal-oss/blob/main/CONTRIBUTING.md)`,
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
      url: 'https://github.com/quintalwebsolutions/quintal-oss.git',
      directory: `packages/${name}`,
    },
    homepage: `https://github.com/quintalwebsolutions/quintal-oss/tree/main/packages/${name}#readme`,
    bugs: `https://github.com/quintalwebsolutions/quintal-oss/labels/%40quintal%2F${name}`,
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
  await createDirIfNotExists(packageDir);

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

  await makePackageJson(packageDir, name, p);
  await makePackageReadme(packageDir, name, p);
}

async function main(): Promise<void> {
  const rootDir = path.join(__dirname, '..');

  makeLabelerYml(rootDir);
  makeCoverageYml(rootDir);

  for (const [name, p] of Object.entries(packages)) {
    await makePackage(path.join(rootDir, 'packages', name), name, p);
  }
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
