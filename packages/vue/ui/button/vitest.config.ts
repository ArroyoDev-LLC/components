// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".

import vue from '@vitejs/plugin-vue';
import { defineProject } from 'vitest/config';

export default defineProject({
  test: { name:'vue.ui.button', environment:'happy-dom', include:['test/**/*.spec.ts'] },
  plugins: [vue()],
});