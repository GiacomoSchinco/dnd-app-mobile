const t = require('@babel/types');

/**
 * Trasforma `import.meta` (usato da pacchetti ESM come zustand) in un riferimento
 * a `globalThis.__ExpoImportMetaRegistry` con fallback a {}.
 * Necessario per il target web, dove il bundle è servito come script classico
 * (senza `type="module"`) e `import.meta` causerebbe un SyntaxError.
 */
function transformImportMeta() {
  return {
    name: 'inline-transform-import-meta',
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
          path.replaceWith(
            t.logicalExpression(
              '||',
              t.memberExpression(t.identifier('globalThis'), t.identifier('__ExpoImportMetaRegistry')),
              t.objectExpression([])
            )
          );
        }
      },
    },
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin', transformImportMeta],
  };
};
