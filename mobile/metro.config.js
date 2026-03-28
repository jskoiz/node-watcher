const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

const sharedDir = path.resolve(__dirname, '../shared');

const config = getDefaultConfig(__dirname);

// Let Metro resolve modules from the shared contracts directory
config.watchFolders = [...(config.watchFolders || []), sharedDir];
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths || []),
  path.resolve(__dirname, 'node_modules'),
];

// Use the package.json `exports` field when resolving modules. This lets
// libraries ship tree-shakeable ESM entry points and reduces bundle size.
config.resolver.unstable_enablePackageExports = true;

module.exports = withStorybook(config, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  configPath: './.rnstorybook',
});
