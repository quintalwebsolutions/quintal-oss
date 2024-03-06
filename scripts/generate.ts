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
  roadmap?: ({ text: string; checked?: boolean; level?: number } | string)[];
  // examples?: { title: string; href: string }[];
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

async function makePackageReadme(dir: string, name: string, p: Package): Promise<void> {
  const filePath = path.join(dir, 'README.md');
  const endMarker = '<!-- END AUTO-GENERATED: Add custom documentation after this comment -->';
  const readme = await fs.promises.readFile(filePath, 'utf-8').catch(() => '');
  const readmeContent = readme.substring(readme.indexOf(endMarker) + endMarker.length);

  const packageName = `@quintal/${name}`;
  const uriPackageName = encodeURIComponent(packageName);
  const shieldsRoot = 'https://img.shields.io';
  const style = '?style=flat-square';

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

    // TODO features

    `You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/${packageName})`,
    '',

    // TODO ToC
    // TODO Roadmap
    // TODO Getting started
    // TODO Examples
  ];

  await fs.promises.writeFile(filePath, readmeHead.join('\n') + endMarker + readmeContent);
}

async function makePackageJson(dir: string, name: string, p: Package): Promise<void> {
  const filePath = path.join(dir, 'package.json');
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
    dependencies: packageJson?.dependencies,
    devDependencies: packageJson?.devDependencies,
    peerDependencies: packageJson?.peerDependencies,
  };

  await fs.promises.writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`);
}

async function makePackage(dir: string, name: string, p: Package): Promise<void> {
  await createDirIfNotExists(dir);

  const srcDir = path.join(dir, 'src');
  const srcExists = await createDirIfNotExists(srcDir);

  const testsDir = path.join(dir, 'tests');
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

  await makePackageJson(dir, name, p);
  await makePackageReadme(dir, name, p);
}

async function main(): Promise<void> {
  for (const [name, p] of Object.entries(packages)) {
    await makePackage(path.join(__dirname, '..', 'packages', name), name, p);
  }
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
