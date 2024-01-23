import recommended from '@quintal/config/vite';

export default {
  ...recommended,
  build: {
    ...recommended.build,
    outDir: '.dist',
  },
};
