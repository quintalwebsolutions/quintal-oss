---
"@quintal/monads": minor
"@quintal/environment": minor
"@quintal/config": minor
---

Ship as ESM-only and bundle with tsdown

- The packages are now ES Modules only (`"type": "module"`, entry point `./.dist/index.js`). The CommonJS build (`index.cjs`) is gone. Node.js versions that support `require()` of ES Modules can still `require` them.
- Declarations are bundled into a single `.dist/index.d.ts` again (the previous release shipped without it).
- `@quintal/config`: `vite.mjs` now only contains the test configuration (`getRecommended()` takes no arguments); library builds are configured with the new `@quintal/config/tsdown.mjs`.
