const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([expoConfig, { ignores: ['dist/**', '.expo/**', 'test-results/**', '.artifact-build/**', 'release/**', 'public/import-worker.js', 'public/speech/**'] }]);
