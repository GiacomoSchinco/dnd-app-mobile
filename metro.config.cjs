// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
  };

  // Esclude gli artefatti di build Android dal file-watcher di Metro:
  // su Windows un path di baselineProfiles rotto faceva crasherare il dev server
  // ("Error: UNKNOWN: unknown error, lstat …"). Le cartelle di build non servono
  // al bundler, solo i sorgenti in `src`/`app`/`assets`/`components`/…
  const defaultBlockList = Array.isArray(resolver.blockList) ? resolver.blockList : [resolver.blockList];
  const androidBuildBlockList = [
    /android[\\/](?:app[\\/]build|build|[.]gradle|[.]cxx)[\\/]/,
  ];

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    blockList: [...defaultBlockList.filter(Boolean), ...androidBuildBlockList],
  };

  return config;
})();
