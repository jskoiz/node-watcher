module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@contracts': '../shared/contracts',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
