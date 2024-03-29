import type { Config } from '../../lib'; // TODO change import into @

// https://www.typescriptlang.org/tsconfig
export type TypescriptConfigShape = {
  /**
   * An allowlist of files to include in the program.
   * An error occurs if any of the files can’t be found.
   *
   * @url https://www.typescriptlang.org/tsconfig#files
   */
  files?: string[];
  /**
   * A path to another tsconfig.json file to inherit from.
   * The configuration from the base file are loaded first, then overridden by those in the inheriting config file.
   * All relative paths found in the configuration file will be resolved relative to the configuration file they originated in.
   *
   * @url https://www.typescriptlang.org/tsconfig#extends
   */
  extends?: string;
  /**
   * An array of filenames or patterns to include in the program.
   * These filenames are resolved relative to the directory containing the tsconfig.json file.
   *
   * @url https://www.typescriptlang.org/tsconfig#include
   */
  include?: string[];
  /**
   * An array of filenames or patterns that should be skipped when resolving include.
   *
   * @url https://www.typescriptlang.org/tsconfig#exclude
   */
  exclude?: string[];
  /**
   * A way to structure your TypeScript programs into smaller pieces.
   *
   * @url https://www.typescriptlang.org/tsconfig#references
   */
  references?: string[];
  /**
   * These options make up the bulk of TypeScript’s configuration and it covers how the language should work.
   *
   * @url https://typescriptlang.org/tsconfig#compiler-options
   */
  compilerOptions: {
    // Type Checking
    /**
     * When:
     * - `undefined` (default) provide suggestions as warnings
     * - `true` unreachable code is ignored
     * - `false` raises compiler errors about unreachable code
     *
     * @url https://www.typescriptlang.org/tsconfig#allowUnreachableCode
     */
    allowUnreachableCode?: boolean;
    /**
     * When:
     * - `undefined` (default) provide suggestions as warnings to editors
     * - `true` unused labels are ignored
     * - `false` raises compiler errors about unused labels
     *
     * @url https://www.typescriptlang.org/tsconfig#allowUnreachableCode
     */
    allowUnusedLabels?: boolean;
    /**
     * Ensures that your files are parsed in the ECMAScript strict mode, and emit “use strict” for each source file.
     *
     * @url https://www.typescriptlang.org/tsconfig#alwaysStrict
     */
    alwaysStrict?: boolean;
    /**
     * Disallows passing `undefined` to a property marked with `?`
     *
     * @url https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes
     */
    exactOptionalPropertyTypes?: boolean;
    /**
     * Ensures that any non-empty case inside a switch statement includes either break, return, or throw.
     *
     * @url https://www.typescriptlang.org/tsconfig#noFallthroughCasesInSwitch
     */
    noFallthroughCasesInSwitch?: boolean;
    /**
     * Issues an error whenever TypeScript would have inferred `any`
     *
     * @url https://www.typescriptlang.org/tsconfig#noImplicitAny
     */
    noImplicitAny?: boolean;
    /**
     * Ensures that functions which override a superclass include the `override` keyword
     *
     * @url https://www.typescriptlang.org/tsconfig#noImplicitOverride
     */
    noImplicitOverride?: boolean;
    /**
     * Checks all code paths in a function to ensure they return a value
     *
     * @url https://www.typescriptlang.org/tsconfig#noImplicitReturns
     */
    noImplicitReturns?: boolean;
    /**
     * Raises an error on ‘this’ expressions with an implied ‘any’ type.
     *
     * @url https://www.typescriptlang.org/tsconfig#noImplicitThis
     */
    noImplicitThis?: boolean;
    /**
     * Ensures consistency between accessing a field via the “dot” and “indexed” syntax
     *
     * @url https://www.typescriptlang.org/tsconfig#noPropertyAccessFromIndexSignature
     */
    noPropertyAccessFromIndexSignature?: boolean;
    /**
     * Adds `undefined` to properties of objects which have unknown keys but known values.
     *
     * @url https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess
     */
    noUncheckedIndexedAccess?: boolean;
    /**
     * Report errors on unused local variables.
     *
     * @url https://www.typescriptlang.org/tsconfig#noUnusedLocals
     */
    noUnusedLocals?: boolean;
    /**
     * Report errors on unused parameters in functions
     *
     * @url https://www.typescriptlang.org/tsconfig#noUnusedParameters
     */
    noUnusedParameters?: boolean;
    /**
     * Enables a wide range of type checking behavior that results in stronger guarantees of program correctness.
     *
     * @url https://www.typescriptlang.org/tsconfig#strict
     */
    strict?: boolean;
    /**
     * Checks if the built-in methods of functions call, bind, and apply are invoked with correct argument for the underlying function
     *
     * @url https://www.typescriptlang.org/tsconfig#strictBindCallApply
     */
    strictBindCallApply?: boolean;
    /**
     * Causes functions parameters to be checked more correctly.
     *
     * @url https://www.typescriptlang.org/tsconfig#strictFunctionTypes
     */
    strictFunctionTypes?: boolean;
    /**
     * Enforces null and undefined as distinct types and triggering an error if you try to use them where a concrete value is expected.
     *
     * @url https://www.typescriptlang.org/tsconfig#strictNullChecks
     */
    strictNullChecks?: boolean;
    /**
     * Raises an error when a class property was declared but not set in the constructor.
     *
     * @url https://www.typescriptlang.org/tsconfig#strictPropertyInitialization
     */
    strictPropertyInitialization?: boolean;
    /**
     * Changes the type of the variable in a catch clause from `any` to `unknown`
     *
     * @url https://www.typescriptlang.org/tsconfig#useUnknownInCatchVariables
     */
    useUnknownInCatchVariables?: boolean;

    // Modules
    /**
     * Suppress an error if you’ve configured your runtime or bundler to handle non-ts files.
     *
     * @url https://www.typescriptlang.org/tsconfig#allowArbitraryExtensions
     */
    allowArbitraryExtensions?: boolean;
    /**
     * Allows TypeScript files to import each other with a TypeScript-specific extension like .ts, .mts, or .tsx.
     *
     * @url https://www.typescriptlang.org/tsconfig#allowImportingTsExtensions
     */
    allowImportingTsExtensions?: boolean;
    /**
     * Allows you access UMD exports as globals from inside module files.
     *
     * @url https://www.typescriptlang.org/tsconfig#allowUmdGlobalAccess
     */
    allowUmdGlobalAccess?: boolean;
    /**
     * Sets a base directory from which to resolve bare specifier module names.
     *
     * @url https://www.typescriptlang.org/tsconfig#baseUrl
     */
    baseUrl?: string;
    /**
     * Takes a list of additional conditions that should succeed when TypeScript resolves from an exports or imports field of a package.json.
     *
     * @url https://www.typescriptlang.org/tsconfig#customConditions
     */
    customConditions?: string[];
    /**
     * Sets the module system for the program.
     *
     * @url https://www.typescriptlang.org/tsconfig#module
     */
    module?: string;
    /**
     * Specify the module resolution strategy.
     *
     * @url https://www.typescriptlang.org/tsconfig#moduleResolution
     */
    moduleResolution?: string;
    /**
     * Overrides the default list of file name suffixes to search when resolving a module.
     *
     * @url https://www.typescriptlang.org/tsconfig#moduleSuffixes
     */
    moduleSuffixes?: string[];
    /**
     * Stops TypeScript from examining the initial set of files for import and <reference directives.
     *
     * @url https://www.typescriptlang.org/tsconfig#noResolve
     */
    noResolve?: boolean;
    /**
     * A series of entries which re-map imports to lookup locations relative to the baseUrl.
     *
     * @url https://www.typescriptlang.org/tsconfig#resolveJsonModule
     */
    paths?: Record<string, string[]>;
    /**
     * Allows importing modules with a .json extension.
     *
     * @url https://www.typescriptlang.org/tsconfig#resolveJsonModule
     */
    resolveJsonModule?: boolean;
    /**
     * Forces TypeScript to consult the exports field of package.json files if it ever reads from a package in node_modules.
     *
     * @url https://www.typescriptlang.org/tsconfig#resolvePackageJsonExports
     */
    resolvePackageJsonExports?: boolean;
    /**
     * forces TypeScript to consult the imports field of package.json files when performing a lookup that starts with # from a file whose ancestor directory contains a package.json.
     *
     * @url https://www.typescriptlang.org/tsconfig#resolvePackageJsonImports
     */
    resolvePackageJsonImports?: boolean;
    /**
     * The root of the output directory structure.
     *
     * @url https://www.typescriptlang.org/tsconfig#rootDir
     */
    rootDir?: string;
    /**
     * Informs the compiler that there are many “virtual” directories acting as a single root.
     *
     * @url https://www.typescriptlang.org/tsconfig#rootDirs
     */
    rootDirs?: string;
    /**
     * If typeRoots is specified, only packages under typeRoots will be included.
     *
     * @url https://www.typescriptlang.org/tsconfig#rootDirs
     */
    typeRoots?: string[];
    /**
     * If types is specified, only packages listed will be included in the global scope.
     *
     * @url https://www.typescriptlang.org/tsconfig#types
     */
    types?: string[];

    // Emit
    /**
     * Generate .d.ts files for every TypeScript or JavaScript file inside your project.
     *
     * @url https://www.typescriptlang.org/tsconfig#declaration
     */
    declaration?: boolean;
    /**
     * Offers a way to configure the root directory for where declaration files are emitted.
     *
     * @url https://www.typescriptlang.org/tsconfig#declarationDir
     */
    declarationDir?: string;
    /**
     * Generates a source map for .d.ts files which map back to the original .ts source file.
     *
     * @url https://www.typescriptlang.org/tsconfig#declarationMap
     */
    declarationMap?: boolean;
    /**
     * Enable support for a more accurate implementation of how modern JavaScript iterates through new concepts in older JavaScript runtimes.
     *
     * @url https://www.typescriptlang.org/tsconfig#downlevelIteration
     */
    downlevelIteration?: boolean;
    /**
     * Controls whether TypeScript will emit a byte order mark (BOM) when writing output files.
     *
     * @url https://www.typescriptlang.org/tsconfig#emitBOM
     */
    emitBOM?: boolean;
    /**
     * Only emit .d.ts files; do not emit .js files.
     *
     * @url https://www.typescriptlang.org/tsconfig#emitDeclarationOnly
     */
    emitDeclarationOnly?: boolean;
    /**
     * Import downleveling helper functions from the tslib module.
     *
     * @url https://www.typescriptlang.org/tsconfig#importHelpers
     */
    importHelpers?: boolean;
    /**
     * Controls how import works.
     *
     * @url https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues
     * @deprecated in favor of verbatimModuleSyntax.
     */
    importsNotUsedAsValues?: 'remove' | 'preserve' | 'error';
    /**
     * Embed the source map content in the .js files.
     *
     * @url https://www.typescriptlang.org/tsconfig#inlineSourceMap
     */
    inlineSourceMap?: boolean;
    /**
     * Include the original content of the .ts file as an embedded string in the source map.
     *
     * @url https://www.typescriptlang.org/tsconfig#inlineSourceMap
     */
    inlineSources?: boolean;
    /**
     * Specify the location where debugger should locate map files instead of generated locations.
     *
     * @url https://www.typescriptlang.org/tsconfig#mapRoot
     */
    mapRoot?: string;
    /**
     * Specify the end of line sequence to be used when emitting files.
     *
     * @url https://www.typescriptlang.org/tsconfig#newLine
     */
    newLine?: 'CRLF' | 'LF';
    /**
     * Do not emit compiler output files like JavaScript source code, source-maps or declarations.
     *
     * @url https://www.typescriptlang.org/tsconfig#noEmit
     */
    noEmit?: boolean;
    /**
     * Instead of importing helpers with importHelpers, you can provide implementations in the global scope for the helpers you use and completely turn off emitting of helper functions.
     *
     * @url https://www.typescriptlang.org/tsconfig#noEmitHelpers
     */
    noEmitHelpers?: boolean;
    /**
     * Do not emit compiler output files like JavaScript source code, source-maps or declarations if any errors were reported.
     *
     * @url https://www.typescriptlang.org/tsconfig#noEmitOnError
     */
    noEmitOnError?: boolean;
    /**
     * If specified, .js (as well as .d.ts, .js.map, etc.) files will be emitted into this directory.
     *
     * @url https://www.typescriptlang.org/tsconfig#outDir
     */
    outDir?: string;
    /**
     * If specified, all global (non-module) files will be concatenated into the single output file specified.
     *
     * @url https://www.typescriptlang.org/tsconfig#outFile
     */
    outFile?: string;
    /**
     * Do not erase const enum declarations in generated code.
     *
     * @url https://www.typescriptlang.org/tsconfig#preserveConstEnums
     */
    preserveConstEnums?: boolean;
    /**
     * Prevents TypeScript from removing an import, even if it appears unused.
     *
     * @url https://www.typescriptlang.org/tsconfig#preserveValueImports
     * @deprecated in favor of verbatimModuleSyntax.
     */
    preserveValueImports?: boolean;
    /**
     * Strips all comments from TypeScript files when converting into JavaScript. Defaults to false.
     *
     * @url https://www.typescriptlang.org/tsconfig#removeComments
     */
    removeComments?: boolean;
    /**
     * Enables the generation of sourcemap files.
     *
     * @url https://www.typescriptlang.org/tsconfig#sourceMap
     */
    sourceMap?: boolean;
    /**
     * Specify the location where a debugger should locate TypeScript files instead of relative source locations.
     *
     * @url https://www.typescriptlang.org/tsconfig#sourceRoot
     */
    sourceRoot?: string;
    /**
     * Do not emit declarations for code that has an @internal annotation in its JSDoc comment.
     *
     * @url https://www.typescriptlang.org/tsconfig#stripInternal
     */
    stripInternal?: boolean;

    // JavaScript Support
    /**
     * Allow JavaScript files to be imported inside your project, instead of just .ts and .tsx files.
     *
     * @url https://www.typescriptlang.org/tsconfig#allowJs
     */
    allowJs?: boolean;
    /**
     * Report errors in JavaScript files
     *
     * @url https://www.typescriptlang.org/tsconfig#checkJs
     */
    checkJs?: boolean;
    /**
     * The maximum dependency depth to search under node_modules and load JavaScript files.
     *
     * @url https://www.typescriptlang.org/tsconfig#maxNodeModuleJsDepth
     */
    maxNodeModuleJsDepth?: number;

    // Editor Support
    /**
     * Rmove the upper limit to the amount of memory TypeScript will allocate.
     *
     * @url https://www.typescriptlang.org/tsconfig#disableSizeLimit
     */
    disableSizeLimit?: boolean;
    /**
     * List of language service plugins to run inside the editor.
     *
     * @url https://www.typescriptlang.org/tsconfig#plugins
     */
    plugins?: { name: string; [key: string]: unknown }[];

    // Interop Constraints
    /**
     * allows you to write an import like: `import React from "react";` instead of: `import * as React from "react";`
     *
     * @url https://www.typescriptlang.org/tsconfig#allowSyntheticDefaultImports
     */
    allowSyntheticDefaultImports?: boolean;
    /**
     * TypeScript treats CommonJS/AMD/UMD modules differently to ES6 modules.
     *
     * @url https://www.typescriptlang.org/tsconfig#esModuleInterop
     */
    esModuleInterop?: boolean;
    /**
     * Issues an error if a program tries to include a file by a casing different from the casing on disk.
     *
     * @url https://www.typescriptlang.org/tsconfig#forceConsistentCasingInFileNames
     */
    forceConsistentCasingInFileNames?: boolean;
    /**
     * Warns you if you write certain code that can’t be correctly interpreted by a single-file transpilation process.
     *
     * @url https://www.typescriptlang.org/tsconfig#isolatedModules
     */
    isolatedModules?: boolean;
    /**
     * Do not resolve the real path of symlinks.
     *
     * @url https://www.typescriptlang.org/tsconfig#preserveSymlinks
     */
    preserveSymlinks?: boolean;
    /**
     * Any imports or exports without a type modifier are left around. Anything that uses the type modifier is dropped entirely.
     *
     * @url https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax
     */
    verbatimModuleSyntax?: boolean;

    // Backwards Compatibility
    /**
     * Controls what encoding is used when reading text files from disk.
     *
     * @url https://www.typescriptlang.org/tsconfig#charset
     * @deprecated because TypeScript now infers the charset
     */
    charset?: string;
    /**
     * Changes the keyof type operator to return string instead of string | number when applied to a type with a string index signature.
     *
     * @url https://www.typescriptlang.org/tsconfig#keyofStringsOnly
     * @deprecated because it is only used to help people keep old TypeScript behaviour.
     */
    keyofStringsOnly?: boolean;
    /**
     * Disables the "use strict" prologue for non-ES6 targets
     *
     * @url https://www.typescriptlang.org/tsconfig#noImplicitUseStrict
     */
    noImplicitUseStrict?: boolean;
    /**
     * Disables unification of type parameters when comparing two generic functions.
     *
     * @url https://www.typescriptlang.org/tsconfig#noStrictGenericChecks
     */
    noStrictGenericChecks?: boolean;
    /**
     * Computes the final file location in a way that is not predictable or consistent.
     *
     * @url https://www.typescriptlang.org/tsconfig#out
     * @deprecated in favour of outDir and outFile
     */
    out?: string;
    /**
     * Disables reporting of excess property errors.
     *
     * @url https://www.typescriptlang.org/tsconfig#suppressExcessPropertyErrors
     */
    suppressExcessPropertyErrors?: boolean;
    /**
     * Suppresses reporting the error about implicit anys when indexing into objects.
     *
     * @url https://www.typescriptlang.org/tsconfig#suppressImplicitAnyIndexErrors
     */
    suppressImplicitAnyIndexErrors?: boolean;

    // Language and Environment
    /**
     * Enables experimental support for emitting type metadata for decorators which works with the module reflect-metadata.
     *
     * @url https://www.typescriptlang.org/tsconfig#emitDecoratorMetadata
     */
    emitDecoratorMetadata?: boolean;
    /**
     * Enables experimental support for decorators, which is a version of decorators that predates the TC39 standardization process.
     *
     * @url https://www.typescriptlang.org/tsconfig#experimentalDecorators
     */
    experimentalDecorators?: boolean;
    /**
     * Controls how JSX constructs are emitted in JavaScript files.
     *
     * @url https://www.typescriptlang.org/tsconfig#jsx
     */
    jsx?: 'preserve' | 'react' | 'react-native' | 'react-jsx' | 'react-jsxdev';
    /**
     * Changes the function called in .js files when compiling JSX Elements using the classic JSX runtime.
     *
     * @url https://www.typescriptlang.org/tsconfig#jsxFactory
     */
    jsxFactory?: string;
    /**
     * Specify the JSX fragment factory function to use when targeting react JSX emit with jsxFactory compiler option is specified.
     *
     * @url https://www.typescriptlang.org/tsconfig#jsxFragmentFactory
     */
    jsxFragmentFactory?: string;
    /**
     * Declares the module specifier to be used for importing the jsx and jsxs factory functions when using jsx as "react-jsx" or "react-jsxdev".
     *
     * @url https://www.typescriptlang.org/tsconfig#jsxImportSource
     */
    jsxImportSource?: string;
    /**
     * Change the default set of type definition for built-in JS APIs
     *
     * @url https://www.typescriptlang.org/tsconfig#lib
     */
    lib?: string[];
    /**
     * Controls how TypeScript determines whether a file is a script or a module.
     *
     * @url https://www.typescriptlang.org/tsconfig#moduleDetection
     */
    moduleDetection?: 'auto' | 'legacy' | 'force';
    /**
     * Disables the automatic inclusion of any library files.
     *
     * @url https://www.typescriptlang.org/tsconfig#noLib
     */
    noLib?: boolean;
    /**
     * Specify the object invoked for createElement when targeting react for TSX files.
     *
     * @url https://www.typescriptlang.org/tsconfig#reactNamespace
     * @deprecated in favor of jsxFactory.
     */
    reactNamespace?: string;
    /**
     * Changes which JS features are downleveled and which are left intact.
     *
     * @url https://www.typescriptlang.org/tsconfig#target
     */
    target?:
      | 'es3'
      | 'es5'
      | 'es6'
      | 'es2015'
      | 'es2016'
      | 'es2017'
      | 'es2018'
      | 'es2019'
      | 'es2020'
      | 'es2021'
      | 'es2022'
      | 'esnext';
    /**
     * Switches to the upcoming ECMA runtime behavior of class fields.
     *
     * @url https://www.typescriptlang.org/tsconfig#useDefineForClassFields
     */
    useDefineForClassFields?: boolean;

    // Compiler Diagnostics
    /**
     * Used to output diagnostic information for debugging.
     *
     * @url https://www.typescriptlang.org/tsconfig#diagnostics
     */
    diagnostics?: boolean;
    /**
     * Print names of files which TypeScript sees as a part of your project and the reason they are part of the compilation.
     *
     * @url https://www.typescriptlang.org/tsconfig#explainFiles
     */
    explainFiles?: boolean;
    /**
     * Discover where TypeScript is spending its time when compiling.
     *
     * @url https://www.typescriptlang.org/tsconfig#extendedDiagnostics
     */
    extendedDiagnostics?: boolean;
    /**
     * This option gives you the chance to have TypeScript emit a v8 CPU profile during the compiler run.
     *
     * @url https://www.typescriptlang.org/tsconfig#generateCpuProfile
     */
    generateCpuProfile?: boolean;
    /**
     * Print names of generated files part of the compilation to the terminal.
     *
     * @url https://www.typescriptlang.org/tsconfig#listEmittedFiles
     */
    listEmittedFiles?: boolean;
    /**
     * Print names of files part of the compilation.
     *
     * @url https://www.typescriptlang.org/tsconfig#listFiles
     */
    listFiles?: boolean;
    /**
     * Have TypeScript print information about its resolution process for each processed file.
     *
     * @url https://www.typescriptlang.org/tsconfig#traceResolution
     */
    traceResolution?: boolean;

    // Projects
    /**
     * Enforces certain constraints which make it possible for build tools (including TypeScript itself, under --build mode) to quickly determine if a project has been built yet.
     *
     * @url https://www.typescriptlang.org/tsconfig#composite
     */
    composite?: boolean;
    /**
     * If your project is large, you can use the flag disableReferencedProjectLoad to disable the automatic loading of all projects.
     *
     * @url https://www.typescriptlang.org/tsconfig#disableReferencedProjectLoad
     */
    disableReferencedProjectLoad?: boolean;
    /**
     * hen working with composite TypeScript projects, this option provides a way to declare that you do not want a project to be included when using features like find all references or jump to definition in an editor.
     *
     * @url https://www.typescriptlang.org/tsconfig#disableSolutionSearching
     */
    disableSolutionSearching?: boolean;
    /**
     * When working with composite TypeScript projects, this option provides a way to go back to the pre-3.7 behavior where d.ts files were used to as the boundaries between modules.
     *
     * @url https://www.typescriptlang.org/tsconfig#disableSourceOfProjectReferenceRedirect
     */
    disableSourceOfProjectReferenceRedirect?: boolean;
    /**
     * Tells TypeScript to save information about the project graph from the last compilation to files stored on disk.
     *
     * @url https://www.typescriptlang.org/tsconfig#incremental
     */
    incremental?: boolean;
    /**
     * This setting lets you specify a file for storing incremental compilation information as a part of composite projects which enables faster building of larger TypeScript codebases.
     *
     * @url https://www.typescriptlang.org/tsconfig#tsBuildInfoFile
     */
    tsBuildInfoFile?: boolean;

    // Output Formatting
    /**
     * Do not truncate error messages.
     *
     * @url https://www.typescriptlang.org/tsconfig#noErrorTruncation
     */
    noErrorTruncation?: boolean;
    /**
     * Whether to keep outdated console output in watch mode instead of clearing the screen every time a change happened.
     *
     * @url https://www.typescriptlang.org/tsconfig#preserveWatchOutput
     */
    preseverWatchOutput?: boolean;
    /**
     * Stylize errors and messages using color and context.
     *
     * @url https://www.typescriptlang.org/tsconfig#pretty
     */
    pretty?: boolean;

    // Completeness
    /**
     * Skip type checking of default library declaration files.
     *
     * @url https://www.typescriptlang.org/tsconfig#skipDefaultLibCheck
     * @deprecated in favour of skipLibCheck
     */
    skipDefaultLibCheck?: boolean;
    /**
     * Skip type checking of declaration files.
     *
     * @url https://www.typescriptlang.org/tsconfig#skipLibCheck
     */
    skipLibCheck?: boolean;

    // Watch Options
    /**
     * When this option is enabled, TypeScript will avoid rechecking/rebuilding all truly possibly-affected files, and only recheck/rebuild files that have changed as well as files that directly import them.
     *
     * @url https://www.typescriptlang.org/tsconfig#assumeChangesOnlyAffectDirectDependencies
     */
    assumeChangesOnlyAffectDirectDependencies?: boolean;
  };
  /**
   * You can configure the how TypeScript --watch works.
   *
   * @url https://www.typescriptlang.org/tsconfig#watchOptions
   */
  watchOptions?: {
    /**
     * The strategy for how individual files are watched.
     *
     * @url https://www.typescriptlang.org/tsconfig#watch-watchFile
     */
    watchFile?:
      | 'fixedPollingInterval'
      | 'priorityPollingInterval'
      | 'dynamicPriorityPolling'
      | 'useFsEvents'
      | 'useFsEventsOnParentDirectory';
    /**
     * The strategy for how entire directory trees are watched under systems that lack recursive file-watching functionality.
     *
     * @url https://www.typescriptlang.org/tsconfig#watch-watchDirectory
     */
    watchDirectory?: 'fixedPollingInterval' | 'dynamicPriorityPolling' | 'useFsEvents';
    /**
     * When using file system events, this option specifies the polling strategy that gets used when the system runs out of native file watchers and/or doesn’t support native file watchers.
     *
     * @url https://www.typescriptlang.org/tsconfig#watch-fallbackPolling
     */
    fallbackPolling?:
      | 'fixedPollingInterval'
      | 'priorityPollingInterval'
      | 'dynamicPriorityPolling'
      | 'synchronousWatchDirectory';
    /**
     * Synchronously call callbacks and update the state of directory watchers on platforms that don`t support recursive watching natively.
     *
     * @url https://www.typescriptlang.org/tsconfig#watch-synchronousWatchDirectory
     */
    synchronousWatchDirectory?: boolean;
    /**
     * Drastically reduce the number of files which are watched during --watch.
     *
     * @url https://www.typescriptlang.org/tsconfig#watch-excludeDirectories
     */
    excludeDirectories?: string[];
    /**
     * You can use excludeFiles to remove a set of specific files from the files which are watched.
     *
     * @url https://www.typescriptlang.org/tsconfig#watch-excludeFiles
     */
    excludeFiles?: string[];
  };
  /**
   * Only important for JavaScript projects, the TypeScript tooling will download types for your modules in the background and outside of your node_modules folder.
   *
   * @url https://www.typescriptlang.org/tsconfig#typeAcquisition
   */
  typeAcquisition?: {
    /**
     * Disables automatic type acquisition in JavaScript projects
     *
     * @url https://www.typescriptlang.org/tsconfig#type-enable
     */
    enable?: boolean;
    /**
     * Specify which types should be used from DefinitelyTyped
     *
     * @url https://www.typescriptlang.org/tsconfig#type-include
     */
    include?: string[];
    /**
     * Disables the type-acquisition for a certain module in JavaScript projects.
     *
     * @url https://www.typescriptlang.org/tsconfig#type-exclude
     */
    exclude?: string[];
    /**
     * Disable TypeScript’s type acquisition inferring what types should be added based on filenames in a project.
     *
     * @url https://www.typescriptlang.org/tsconfig#type-disableFilenameBasedTypeAcquisition
     */
    disableFilenameBasedTypeAcquisition?: boolean;
  };
};

export const typescriptConfig: Config<TypescriptConfigShape> = (config) => ({
  name: 'TypeScript',
  config,
  dependencies: [{ type: 'dev', name: 'typescript', version: '5.4.3' }],
});
