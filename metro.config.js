// Learn more https://docs.expo.io/guides/customizing-metro
// Polyfill for Node < 20 (Array.prototype.toReversed is ES2023)
if (typeof Array.prototype.toReversed === 'undefined') {
  Array.prototype.toReversed = function () {
    return this.slice().reverse();
  };
}
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
