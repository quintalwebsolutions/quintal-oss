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

async function makeRootReadme(rootDir: string): Promise<void> {
  const filePath = path.join(rootDir, 'README.md');

  const repoName = 'quintalwebsolutions/quintal-oss';
  const githubRoot = `https://github.com/${repoName}`;
  const shieldsRoot = 'https://img.shields.io';
  const style = '?style=flat-square';

  const content = [
    '# Quintal Open Source Software',
    '',
    `![Typescript](${shieldsRoot}/badge/TypeScript-007ACC${style}&logo=typescript&logoColor=white)`,
    `[![Build status](${shieldsRoot}/github/actions/workflow/status/${repoName}/release.yml${style})](${githubRoot}/actions/workflows/release.yml)`,
    `[![Code coverage](${shieldsRoot}/codecov/c/github/${repoName}${style}&token=3ORY9UP6H7&logo=codecov)](https://codecov.io/gh/${repoName})`,
    `[![GitHub License](${shieldsRoot}/github/license/${repoName})](${githubRoot}/blob/main/LICENSE)`,
    `[![Pull requests welcome](${shieldsRoot}/badge/PRs-welcome-brightgreen.svg${style})](${githubRoot}/blob/main/CONTRIBUTING.md)`,
    `[![Contributor Covenant](${shieldsRoot}/badge/Contributor%20Covenant-2.1-4baaaa.svg${style})](${githubRoot}/blob/main/CODE_OF_CONDUCT.md)`,
    // TODO code quality metrics
    // [![LGTM Code quality grade: Typescript](https://img.shields.io/lgtm/grade/javascript/g/saphewilliam/saphe-packages.svg?logo=lgtm&logoWidth=18&style=flat-square)](https://lgtm.com/projects/g/saphewilliam/saphe-packages/context:javascript)
    // [![Total LGTM alerts](https://img.shields.io/lgtm/alerts/g/saphewilliam/saphe-packages.svg?logo=lgtm&logoWidth=18&style=flat-square)](https://lgtm.com/projects/g/saphewilliam/saphe-packages/alerts/)
    '',
    'A package ecosystem dedicated to improving developer experience and type-safety in your next TypeScript project.',
    '',
    '## Packages',
    '',
    'name|version|description',
    '-|-|-',
    ...Object.entries(packages).map(
      ([n, p]) =>
        `\`@quintal/${n}\`|[![npm version](https://img.shields.io/npm/v/@quintal/${n}.svg?style=flat-square)](https://www.npmjs.com/package/@quintal/${n})|${p.description})`,
    ),
    '',
    '## Contributing to the project',
    '',
    'The Quintal package ecosystem is open for contributions! Please read the [contributing guide](https://github.com/quintalwebsolutions/quintal-oss/blob/chore/nuke-eslint-prettier/CONTRIBUTING.md) for more details.',
    '',
    '## Support us',
    '',
    "If you, or the company you work at, has been using one or more of our packages, please consider supporting us through GitHub Sponsors. This way, you're directly supporting our cause!",
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
  const repoName = 'quintalwebsolutions/quintal-oss';
  const githubRoot = `https://github.com/${repoName}`;
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
    `[![License](${shieldsRoot}/npm/l/${packageName}${style})](${githubRoot}/blob/main/LICENSE)`,
    `[![Bundle size](${shieldsRoot}/bundlephobia/minzip/${packageName}${style})](https://bundlephobia.com/package/${packageName})`,
    `[![Dependencies](${shieldsRoot}/librariesio/release/npm/${packageName}${style})](https://libraries.io/npm/${uriPackageName}/)`,
    `[![Code coverage](${shieldsRoot}/codecov/c/github/${repoName}${style}&token=3ORY9UP6H7&flag=${name}&logo=codecov)](https://codecov.io/gh/${repoName})`,
    `[![Pull requests welcome](${shieldsRoot}/badge/PRs-welcome-brightgreen.svg${style})](${githubRoot}/blob/main/CONTRIBUTING.md)`,
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
