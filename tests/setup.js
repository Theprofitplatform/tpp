// Test setup file
const { TextEncoder, TextDecoder } = require('util');

// Polyfill TextEncoder/TextDecoder for JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;