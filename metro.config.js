// Expo Metro config: add support for GLB/GLTF asset files
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  const { resolver } = config;

  // Allow bundling .glb and .gltf via require()
  resolver.assetExts = resolver.assetExts.concat(['glb', 'gltf']);

  return config;
})();
