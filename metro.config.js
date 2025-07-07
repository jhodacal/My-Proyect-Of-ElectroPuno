// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Añade el resolver para los módulos principales de Node.js
config.resolver.extraNodeModules = require('node-libs-browser');

// Mapea los módulos Node.js a sus polyfills compatibles con el navegador
Object.assign(config.resolver.extraNodeModules, {
  'stream': require.resolve('stream-browserify'),
  'buffer': require.resolve('buffer'),
  'util': require.resolve('util'),
  'url': require.resolve('url/url.js'),
  'assert': require.resolve('assert'),
  'events': require.resolve('events'),
  'path': require.resolve('path-browserify'),
  'process': require.resolve('process/browser'),
  'crypto': require.resolve('react-native-crypto'),
  'vm': require.resolve('vm-browserify'),
  'constants': require.resolve('constants-browserify'),
  'domain': require.resolve('domain-browser'),
  'http': require.resolve('stream-http'),
  'https': require.resolve('https-browserify'),
  'os': require.resolve('os-browserify/browser'),
  'punycode': require.resolve('punycode'),
  'querystring': require.resolve('querystring-es3'),
  'string_decoder': require.resolve('string_decoder'),
  'sys': require.resolve('util'),
  'timers': require.resolve('timers-browserify'),
  'tty': require.resolve('tty-browserify'),
  'zlib': require.resolve('browserify-zlib')
});

// Asegúrate de que el resolver para CommonJS esté activo
if (!config.resolver.assetExts.includes('cjs')) {
  config.resolver.assetExts.push('cjs');
}

// Permite que Expo Bundler sepa dónde buscar módulos en node_modules
config.resolver.nodeModulesPaths = [require('path').resolve(config.projectRoot, 'node_modules')];

module.exports = config;