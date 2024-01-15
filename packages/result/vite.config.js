const recommended = require('@quintal/config/vite');

module.exports = {
  ...recommended,
  build: {
    ...recommended.build,
    outDir: '.dist',
  },
};
