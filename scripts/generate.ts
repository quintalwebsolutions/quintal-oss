import fs from 'node:fs';
import path from 'node:path';
import { workspace } from '../workspace';

export type Label = {
  name: string;
  color: `#${string}`;
  description: string;
};

export type Labels = Label[];

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

export type Workspace = {
  labels: Labels;
  packages: Packages;
};

const repoName = 'quintalwebsolutions/quintal-oss';
const githubRoot = `https://github.com/${repoName}`;
const shieldRoot = 'https://img.shields.io';
const shieldStyle = '?style=flat-square';
const ignoreDirs = ['.coverage', '.coverage-ts', '.dist', '.turbo', 'node_modules'];

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

function getComment(filePath: string): string[] {
  const ext = path.extname(filePath);
  const comment = [
    'THIS FILE IS (PARTIALLY) AUTO-GENERATED USING `pnpm generate`.',
    'TO EDIT THE CONTENT, PLEASE MODIFY `/workspace.ts` OR `/scripts/generate.ts`',
  ];

  switch (ext) {
    case '.md':
      return ['<!--', ...comment, '-->', ''];
    case '.mjs':
      return ['/**', ...comment.map((c) => ` * ${c}`), ' */', ''];
    case '.yml': {
      const length = Math.max(...comment.map((c) => c.length));
      const border = '#'.repeat(4 + length);
      return [border, ...comment.map((c) => `# ${c.padEnd(length)} #`), border, ''];
    }
    case '.json':
      return []; // Comments are not allowed in JSON
    default:
      throw new Error(`File extension ${ext} not recognised`);
  }
}

async function writeFile(filePathSegments: string[], content: string[]): Promise<void> {
  const filePath = path.join(...filePathSegments);
  const comment = getComment(filePath);

  await fs.promises.writeFile(filePath, comment.concat(content).join('\n'));
}

async function makeLabelerYml(rootDir: string): Promise<void> {
  await writeFile(
    [rootDir, '.github', 'labeler.yml'],
    Object.keys(workspace.packages).map((packageName) =>
      [
        `"@quintal/${packageName}":`,
        '  - changed-files:',
        `    - any-glob-to-any-file: packages/${packageName}/*`,
        '',
      ].join('\n'),
    ),
  );
}

async function makeLabelsYml(rootDir: string): Promise<void> {
  await writeFile(
    [rootDir, '.github', 'labels.yml'],
    Object.keys(workspace.packages)
      .map((n) => ({
        name: `@quintal/${n}`,
        color: '#FBCA04',
        description: `Issues or pull requests related to the @quintal/${n} package`,
      }))
      .concat(workspace.labels)
      .map((label) =>
        [
          `- name: '${label.name}'`,
          `  color: '${label.color}'`,
          `  description: '${label.description}'`,
          '',
        ].join('\n'),
      ),
  );
}

async function makeCollectTestAnalyticsYml(rootDir: string): Promise<void> {
  await writeFile(
    [rootDir, '.github', 'actions', 'collect_test_analytics', 'action.yml'],
    [
      'name: Collect Test Analytics',
      'description: Collect test analytics from all packages and upload to Codecov',
      '',
      'inputs:',
      '  token:',
      '    required: true',
      "    description: 'Codecov token'",
      '',
      'runs:',
      '  using: composite',
      '  steps:',
    ].concat(
      Object.keys(workspace.packages).map((packageName) =>
        [
          `    - name: Upload @quintal/${packageName} coverage to Codecov`,
          `      if: \${{ !cancelled() && hashFiles('./packages/${packageName}/.coverage/coverage-final.json') != '' }}`,
          '      uses: codecov/codecov-action@v4',
          '      with:',
          '        fail_ci_if_error: true',
          '        disable_search: true',
          `        file: ./packages/${packageName}/.coverage/coverage-final.json`,
          `        flags: ${packageName}`,
          '        token: ${{ inputs.token }}',
          '',
          `    - name: Upload @quintal/${packageName} analytics to Codecov`,
          `      if: \${{ !cancelled() && hashFiles('./packages/${packageName}/junit.xml') != '' }}`,
          '      uses: codecov/test-results-action@v1',
          '      with:',
          '        fail_ci_if_error: true',
          '        disable_search: true',
          `        file: ./packages/${packageName}/junit.xml`,
          `        flags: ${packageName}`,
          '        token: ${{ inputs.token }}',
          '',
        ].join('\n'),
      ),
    ),
  );
}

async function makeRootReadme(rootDir: string): Promise<void> {
  await writeFile(
    [rootDir, 'README.md'],
    [
      '# Quintal Open Source Software',
      '',
      `![Top language](${shieldRoot}/github/languages/top/quintalwebsolutions/quintal-oss${shieldStyle}&logo=typescript&logoColor=FAF9F8&labelColor=3178C6&color=3178C6)`,
      `[![Build status](${shieldRoot}/github/actions/workflow/status/${repoName}/release.yml${shieldStyle})](${githubRoot}/actions/workflows/release.yml)`,
      `[![Codacy grade](${shieldRoot}/codacy/grade/bb3b006255104e4da8b9a4a7793dcffe${shieldStyle}&logo=codacy)](https://app.codacy.com/gh/${repoName}/dashboard)`,
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
      ...Object.entries(workspace.packages).map(
        ([n, p]) =>
          `[\`@quintal/${n}\`](${githubRoot}/tree/main/packages/${n})|[![npm version](${shieldRoot}/npm/v/@quintal/${n}.svg${shieldStyle})](https://www.npmjs.com/package/@quintal/${n})|${p.description}`,
      ),
      '',
      '## Contributing to the project',
      '',
      `The Quintal package ecosystem is open for contributions! Please read the [contributing guide](${githubRoot}/blob/main/CONTRIBUTING.md) for more details.`,
      '',
      '## Support us',
      '',
      "If you or the company you work at has found value in using one or more of our packages, please consider [supporting us through GitHub Sponsors](https://github.com/sponsors/quintalwebsolutions). This way, you're directly empowering us to fulfill our cause of improving developer experience and type-safety in the TypeScript community's day-to-day coding practices!",
      '',
    ],
  );
}

async function makePackageReadme(packageDir: string, name: string, p: Package): Promise<void> {
  const filePath = path.join(packageDir, 'README.md');
  const readmeEndMarker =
    '<!-- END AUTO-GENERATED: Add custom documentation after this comment -->';
  const readme = await fs.promises.readFile(filePath, 'utf-8').catch(() => '');
  const readmeContent = readme.substring(
    readme.indexOf(readmeEndMarker) + readmeEndMarker.length + 1,
  );

  const packageName = `@quintal/${name}`;

  const makeListSection = <TItem>(
    arr: TItem[] | undefined,
    title: string,
    description: string | null,
    makeItem: (item: TItem, index: number) => string,
  ) =>
    arr && arr.length > 0
      ? [`## ${title}`, '']
          .concat(description ? [description, ''] : [])
          .concat(arr.map(makeItem))
          .concat([''])
      : [];

  await writeFile(
    [filePath],
    [
      // Title
      `# ${p.title}`,
      '',

      // Badges
      `[![NPM version](${shieldRoot}/npm/v/${packageName}${shieldStyle})](https://npmjs.com/${packageName})`,
      `[![NPM downloads](${shieldRoot}/npm/dt/${packageName}${shieldStyle})](https://npmjs.com/${packageName})`,
      `[![License](${shieldRoot}/npm/l/${packageName}${shieldStyle})](${githubRoot}/blob/main/LICENSE)`,
      `[![Bundle size](${shieldRoot}/bundlephobia/minzip/${packageName}${shieldStyle})](https://bundlephobia.com/package/${packageName})`,
      `[![Code coverage](${shieldRoot}/codecov/c/github/${repoName}${shieldStyle}&token=3ORY9UP6H7&flag=${name}&logo=codecov)](https://app.codecov.io/gh/${repoName}/flags?historicalTrend=LAST_7_DAYS&flags%5B0%5D=${name})`,
      `[![Pull requests welcome](${shieldRoot}/badge/PRs-welcome-brightgreen.svg${shieldStyle})](${githubRoot}/blob/main/CONTRIBUTING.md)`,
      '',

      // Description
      p.description,
      '',

      // Features
      ...makeListSection(
        p.features,
        'Features',
        null,
        ({ icon, text }, i) => `- ${icon} ${text}${i + 1 === p.features?.length ? '.' : ','}`,
      ),

      // Roadmap
      ...makeListSection(
        p.roadmap,
        'Roadmap',
        'The following features are planned for future releases:',
        ({ level: l, checked: c, text: t }) =>
          `${' '.repeat((l ?? 0) * 2)}- [${c ? 'x' : ' '}] ${t}`,
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
      '',

      // Examples
      ...makeListSection(
        p.examples,
        'Examples',
        'Check out these examples to get started quickly:',
        (example) => `- [${example.title}](${example.href})`,
      ),

      // Rest of README content
      readmeEndMarker,
      readmeContent,
    ],
  );
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
      clean: `shx rm -rf ${ignoreDirs.join(' ')}`,
      dev: 'vitest --watch',
      lint: 'pnpm lint:fix && pnpm lint:types',
      'lint:check': 'biome ci',
      'lint:fix': 'biome check --write',
      'lint:types': 'tsc --noEmit',
      test: 'vitest',
    },
    peerDependencies: packageJson?.peerDependencies,
    dependencies: packageJson?.dependencies,
    devDependencies: packageJson?.devDependencies,
  };

  await writeFile([filePath], [`${JSON.stringify(content, null, 2)}\n`]);
}

async function makePackageViteConfig(packageName: string, packageDir: string): Promise<void> {
  await writeFile(
    [packageDir, 'vite.config.mjs'],
    [
      "import getRecommended from '@quintal/config/vite';",
      '',
      `export default getRecommended(\'${packageName}\');`,
      '',
    ],
  );
}

async function makePackageTsConfig(packageDir: string): Promise<void> {
  await writeFile(
    [packageDir, 'tsconfig.json'],
    ['{', '  "extends": "@quintal/config/tsconfig/base.json"', '}', ''],
  );
}

async function makePackage(packageDir: string, name: string, p: Package): Promise<void> {
  const dirExists = await createDirIfNotExists(packageDir);

  await makePackageJson(packageDir, name, p);
  await makePackageReadme(packageDir, name, p);
  await makePackageViteConfig(`@quintal/${name}`, packageDir);
  await makePackageTsConfig(packageDir);

  if (dirExists) return;

  const srcDir = path.join(packageDir, 'src');
  const srcExists = await createDirIfNotExists(srcDir);

  const testsDir = path.join(packageDir, 'tests');
  const testsExists = await createDirIfNotExists(testsDir);

  if (!(srcExists || testsExists)) {
    await writeFile(
      [srcDir, 'index.ts'],
      ['export const add = (a: number, b: number): number => {', '  return a + b;', '};', ''],
    );
    await writeFile(
      [testsDir, 'index.spec.ts'],
      [
        "import { describe, expect, it } from 'vitest';",
        "import { add } from '../src';",
        '',
        "describe('add', () => {",
        "  it('adds integers', () => {",
        '    expect(add(1, 2)).toBe(3);',
        '  });',
        '});',
        '',
      ],
    );
  }
}

async function main(): Promise<void> {
  const rootDir = path.join(__dirname, '..');

  await Promise.all([
    makeRootReadme(rootDir),
    makeLabelerYml(rootDir),
    makeLabelsYml(rootDir),
    makeCollectTestAnalyticsYml(rootDir),
    ...Object.entries(workspace.packages).map(([name, p]) =>
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
