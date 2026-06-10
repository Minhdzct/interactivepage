import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

// Only enable Angular plugin when not running tests
const plugins = [] as any[];
if (!process.env.VITEST) {
  plugins.push(angular());
}

export default defineConfig({
  plugins,
  test: {
    environment: 'jsdom',
  },
});
