// Enable loading .glb and .gltf assets with Metro (Expo)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure custom 3D model extensions are treated as assets
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'glb',
  'gltf',
];

// Add Node.js polyfills for react-native-svg
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: require.resolve('buffer/'),
};

module.exports = config;
