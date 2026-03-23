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

module.exports = withStorybook(config, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  configPath: './.rnstorybook',
});
